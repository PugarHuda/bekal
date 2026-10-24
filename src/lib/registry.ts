// The public registry, read from the Ethereum Attestation Service on Base Sepolia. Candidates come straight from the
// chain: EAS's Attested event indexes recipient, attester and schema, so one eth_getLogs over the registry's whole life
// (an RPC that serves wide ranges) finds a centre's recognitions or a record's withdrawal the moment they are mined.
// The keyless EAS indexer (easscan GraphQL) is the fallback when no such RPC answers, and it also finds withdrawals
// written before they carried their id in the recipient. Every candidate is then read again from the EAS contract
// (getAttestation), so neither the logs' RPC nor the indexer can make a centre look recognised or a record withdrawn.
import { AbiCoder, Contract, JsonRpcProvider, Wallet, ZeroHash, dataSlice, getAddress, id as topicOf, zeroPadValue } from "ethers"
import config from "../config.json"
import { credentialId, revocationRecipient } from "./schemas.ts"
import type { Recognition, Registry } from "./credential.ts"

const coder = AbiCoder.defaultAbiCoder()
const EAS_ABI = ["function getAttestation(bytes32 uid) view returns ((bytes32 uid,bytes32 schema,uint64 time,uint64 expirationTime,uint64 revocationTime,bytes32 refUID,address recipient,address attester,bool revocable,bytes data))"]
const ATTESTED = topicOf("Attested(address,address,bytes32,bytes32)")
type Onchain = { uid: string; schema: string; time: bigint; expirationTime: bigint; revocationTime: bigint; recipient: string; attester: string; data: string }

/** getAttestation from the first public RPC that answers. */
async function onchain(uid: string): Promise<Onchain> {
    let last: unknown
    for (const url of config.rpcs) {
        try {
            const eas = new Contract(config.eas, EAS_ABI, new JsonRpcProvider(url, config.chainId, { staticNetwork: true }))
            return (await eas.getAttestation(uid)) as Onchain
        } catch (e) {
            last = e
        }
    }
    throw new Error(`no public RPC answered (${(last as Error)?.message ?? last})`)
}

/** Attested logs for these indexed topics over the registry's whole life, newest first; null when no RPC serves the range. */
async function attestedLogs(recipient: string | null, attesters: string[], schema: string): Promise<string[] | null> {
    const topics = [ATTESTED, recipient ? zeroPadValue(recipient, 32) : null, attesters.map((a) => zeroPadValue(a, 32)), schema]
    for (const url of config.logRpcs) {
        try {
            const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(15e3), body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_getLogs", params: [{ address: config.eas, fromBlock: "0x" + config.fromBlock.toString(16), toBlock: "latest", topics }] }) })
            const j = await res.json()
            if (!Array.isArray(j.result)) throw new Error(j.error?.message ?? "no result")
            return (j.result as { data: string }[]).map((l) => dataSlice(l.data, 0, 32)).reverse() // data = uid
        } catch {}
    }
    return null
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(config.graphql, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(20e3) })
    if (!res.ok) throw new Error(`EAS indexer answered ${res.status}`)
    const j = await res.json()
    if (j.errors?.length) throw new Error(`EAS indexer: ${j.errors[0].message}`)
    return j.data as T
}

const rootList = config.roots.map((r) => getAddress(r.address))
const live = (a: Onchain, now: bigint) => a.uid !== ZeroHash && a.revocationTime === 0n && (a.expirationTime === 0n || a.expirationTime > now)

export const registry: Registry = {
    async recognition(issuer) {
        const who = getAddress(issuer)
        const uids = (await attestedLogs(who, rootList, config.schemas.recognition)) ?? (await gql<{ attestations: { id: string }[] }>(
            `query($s: String!, $r: String!, $a: [String!]) { attestations(where: { schemaId: { equals: $s }, recipient: { equals: $r }, attester: { in: $a }, revoked: { equals: false } }, orderBy: [{ time: desc }], take: 5) { id } }`,
            { s: config.schemas.recognition, r: who, a: rootList }
        )).attestations.map((x) => x.id)
        const now = BigInt(Math.floor(Date.now() / 1000))
        for (const uid of uids.slice(0, 5)) {
            const a = await onchain(uid)
            if (a.schema !== config.schemas.recognition || getAddress(a.recipient) !== who || !rootList.includes(getAddress(a.attester)) || !live(a, now)) continue
            const [name, place, by] = coder.decode(["string", "string", "string"], a.data) as unknown as [string, string, string]
            return { recognised: true, name, place, by, uid }
        }
        return { recognised: false, reason: "no recognition by a trusted body is on the registry for this centre's key" } satisfies Recognition
    },

    async revoked(issuer, jti) {
        const who = getAddress(issuer)
        const data = coder.encode(["bytes32"], [credentialId(jti)])
        const fromLogs = (await attestedLogs(revocationRecipient(jti), [who], config.schemas.revocation)) ?? []
        // Withdrawals made before the recipient carried the id are only findable by their data, through the indexer.
        const fromIndex = fromLogs.length ? [] : await gql<{ attestations: { id: string }[] }>(
            `query($s: String!, $a: String!, $d: String!) { attestations(where: { schemaId: { equals: $s }, attester: { equals: $a }, data: { equals: $d } }, take: 5) { id } }`,
            { s: config.schemas.revocation, a: who, d: data }
        ).then((r) => r.attestations.map((x) => x.id)).catch(() => [])
        for (const uid of [...fromLogs, ...fromIndex]) {
            const a = await onchain(uid)
            if (a.schema === config.schemas.revocation && getAddress(a.attester) === who && a.data.toLowerCase() === data.toLowerCase()) return { revoked: true, uid }
        }
        return { revoked: false }
    }
}

const ATTEST_ABI = ["function attest((bytes32 schema,(address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value) data)) payable returns (bytes32)"]

/** A centre withdraws one of its records: a permanent EAS attestation from the centre's own key (it pays the gas). */
export async function revoke(issuerKey: string, jti: string): Promise<string> {
    const wallet = new Wallet(issuerKey, new JsonRpcProvider(config.rpcs[0], config.chainId, { staticNetwork: true }))
    if ((await wallet.provider!.getBalance(wallet.address)) === 0n) throw new Error(`this centre's key ${wallet.address} has no ${config.network} ETH for gas`)
    const eas = new Contract(config.eas, ATTEST_ABI, wallet)
    const tx = await eas.attest({ schema: config.schemas.revocation, data: { recipient: revocationRecipient(jti), expirationTime: 0n, revocable: false, refUID: ZeroHash, data: coder.encode(["bytes32"], [credentialId(jti)]), value: 0n } })
    await tx.wait()
    return tx.hash as string
}
