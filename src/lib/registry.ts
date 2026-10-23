// The public registry, read from the Ethereum Attestation Service on Base Sepolia. The keyless EAS indexer (easscan
// GraphQL) finds candidate attestations; each one used is then read again from the EAS contract itself over public RPC
// (getAttestation), so a wrong or stale indexer can hide a record, but can never make a centre look recognised or a
// record look revoked when the chain says otherwise.
import { AbiCoder, Contract, JsonRpcProvider, Wallet, ZeroAddress, ZeroHash, getAddress } from "ethers"
import config from "../config.json"
import { credentialId } from "./schemas.ts"
import type { Recognition, Registry } from "./credential.ts"

const coder = AbiCoder.defaultAbiCoder()
const EAS_ABI = ["function getAttestation(bytes32 uid) view returns ((bytes32 uid,bytes32 schema,uint64 time,uint64 expirationTime,uint64 revocationTime,bytes32 refUID,address recipient,address attester,bool revocable,bytes data))"]
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

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch(config.graphql, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(20e3) })
    if (!res.ok) throw new Error(`EAS indexer answered ${res.status}`)
    const j = await res.json()
    if (j.errors?.length) throw new Error(`EAS indexer: ${j.errors[0].message}`)
    return j.data as T
}

const roots = new Map(config.roots.map((r) => [r.address.toLowerCase(), r.label]))
const live = (a: Onchain, now: bigint) => a.uid !== ZeroHash && a.revocationTime === 0n && (a.expirationTime === 0n || a.expirationTime > now)

export const registry: Registry = {
    async recognition(issuer) {
        const who = getAddress(issuer)
        const { attestations } = await gql<{ attestations: { id: string }[] }>(
            `query($s: String!, $r: String!, $a: [String!]) { attestations(where: { schemaId: { equals: $s }, recipient: { equals: $r }, attester: { in: $a }, revoked: { equals: false } }, orderBy: [{ time: desc }], take: 5) { id } }`,
            { s: config.schemas.recognition, r: who, a: config.roots.map((r) => getAddress(r.address)) }
        )
        const now = BigInt(Math.floor(Date.now() / 1000))
        for (const { id } of attestations) {
            const a = await onchain(id)
            if (a.schema !== config.schemas.recognition || getAddress(a.recipient) !== who || !roots.has(a.attester.toLowerCase()) || !live(a, now)) continue
            const [name, place, by] = coder.decode(["string", "string", "string"], a.data) as unknown as [string, string, string]
            return { recognised: true, name, place, by, uid: id }
        }
        return { recognised: false, reason: "no recognition by a trusted body is on the registry for this centre's key" } satisfies Recognition
    },

    async revoked(issuer, jti) {
        const who = getAddress(issuer)
        const id = credentialId(jti)
        const { attestations } = await gql<{ attestations: { id: string }[] }>(
            `query($s: String!, $a: String!, $d: String!) { attestations(where: { schemaId: { equals: $s }, attester: { equals: $a }, data: { equals: $d } }, take: 5) { id } }`,
            { s: config.schemas.revocation, a: who, d: coder.encode(["bytes32"], [id]) }
        )
        for (const x of attestations) {
            const a = await onchain(x.id)
            if (a.schema === config.schemas.revocation && getAddress(a.attester) === who && a.data.toLowerCase() === coder.encode(["bytes32"], [id]).toLowerCase()) return { revoked: true, uid: x.id }
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
    const tx = await eas.attest({ schema: config.schemas.revocation, data: { recipient: ZeroAddress, expirationTime: 0n, revocable: false, refUID: ZeroHash, data: coder.encode(["bytes32"], [credentialId(jti)]), value: 0n } })
    await tx.wait()
    return tx.hash as string
}
