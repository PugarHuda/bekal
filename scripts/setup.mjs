#!/usr/bin/env node
// One-time setup on Base Sepolia, all through the Ethereum Attestation Service (EAS predeploys, no contract of ours):
//   1. register the two schemas: an issuer's recognition (revocable), and a credential's revocation (permanent);
//   2. a recognition root: in a pilot this is UNHCR's list of recognised learning centres or an NGO consortium; here it is
//      the prototype's own key, and every recognition it signs says so;
//   3. recognise the public demo centre (its key is published on purpose, so anyone can try issuing) and give it a little
//      gas for revocations;
//   4. issue one record from the demo centre and revoke it on-chain, as a fixture the tests verify against the live chain.
// Writes src/config.json and test/fixtures/revoked.txt. Keys go to .env (BEKAL_ROOT_KEY, FUNDER_KEY), never to git.
//
//   FUNDER_KEY=0x… node scripts/setup.mjs     (a Base Sepolia key with ~0.01 ETH, used once to fund the root)
import fs from "node:fs"
import path from "node:path"
import { ethers } from "ethers"
import { issue, present } from "../src/lib/credential.ts"
import { SCHEMAS, credentialId } from "../src/lib/schemas.ts"

const ROOT = path.join(import.meta.dirname, "..")
try { process.loadEnvFile(path.join(ROOT, ".env")) } catch {}
const CHAIN = 84532
const RPC = process.env.RPC_URL || "https://base-sepolia-rpc.publicnode.com"
const EAS = "0x4200000000000000000000000000000000000021"
const REGISTRY = "0x4200000000000000000000000000000000000020"
const provider = new ethers.JsonRpcProvider(RPC, CHAIN, { staticNetwork: true })
const eas = new ethers.Contract(EAS, [
    "function attest((bytes32 schema,(address recipient,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data,uint256 value) data)) payable returns (bytes32)",
    "event Attested(address indexed recipient, address indexed attester, bytes32 uid, bytes32 indexed schemaUID)"
], provider)
const registry = new ethers.Contract(REGISTRY, ["function register(string schema,address resolver,bool revocable) returns (bytes32)", "function getSchema(bytes32 uid) view returns ((bytes32 uid,address resolver,bool revocable,string schema))"], provider)
const uidOf = (s) => ethers.solidityPackedKeccak256(["string", "address", "bool"], [s.schema, ethers.ZeroAddress, s.revocable])
const coder = ethers.AbiCoder.defaultAbiCoder()

function envKey(name) {
    if (process.env[name]) return process.env[name]
    const key = ethers.Wallet.createRandom().privateKey
    fs.appendFileSync(path.join(ROOT, ".env"), `${name}=${key}\n`)
    process.env[name] = key
    return key
}
async function attest(wallet, schema, recipient, types, values, revocable) {
    const tx = await eas.connect(wallet).attest({ schema: uidOf(schema), data: { recipient, expirationTime: 0n, revocable, refUID: ethers.ZeroHash, data: coder.encode(types, values), value: 0n } })
    const rc = await tx.wait()
    const uid = rc.logs.map((l) => { try { return eas.interface.parseLog(l) } catch { return null } }).find((x) => x?.name === "Attested").args.uid
    return { uid, tx: tx.hash }
}

const root = new ethers.Wallet(envKey("BEKAL_ROOT_KEY"), provider)
const cfgFile = path.join(ROOT, "src/config.json")
const config = fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, "utf8")) : {}
const demo = config.demoIssuer?.privateKey ? new ethers.Wallet(config.demoIssuer.privateKey, provider) : ethers.Wallet.createRandom().connect(provider)

// Gas: the funder tops up the root once; the root keeps the demo centre able to revoke.
const top = async (from, to, want) => {
    const bal = await provider.getBalance(to)
    if (bal >= want / 2n) return
    await (await from.sendTransaction({ to, value: want - bal })).wait()
    console.log(`funded ${to} with ${ethers.formatEther(want - bal)} ETH`)
}
if ((await provider.getBalance(root.address)) < ethers.parseEther("0.002")) {
    if (!process.env.FUNDER_KEY) throw new Error(`fund the root ${root.address} with ~0.006 Base Sepolia ETH, or set FUNDER_KEY`)
    await top(new ethers.Wallet(process.env.FUNDER_KEY, provider), root.address, ethers.parseEther("0.006"))
}
await top(root, demo.address, ethers.parseEther("0.001"))

for (const s of Object.values(SCHEMAS)) {
    if ((await registry.getSchema(uidOf(s))).uid === ethers.ZeroHash) {
        await (await registry.connect(root).register(s.schema, ethers.ZeroAddress, s.revocable)).wait()
        console.log(`registered ${s.schema}`)
    }
}

const name = "Demo Learning Centre (public test key)"
const place = "Kuala Lumpur, Malaysia (demo)"
const by = "Bekal prototype root: a test key, not an accrediting body"
const recognition = config.demoIssuer?.recognitionUid ? { uid: config.demoIssuer.recognitionUid } : await attest(root, SCHEMAS.recognition, demo.address, ["string", "string", "string"], [name, place, by], true)
console.log(`demo centre ${demo.address} recognised: ${recognition.uid}`)

// Saved before the fixture, so a failure after this point never loses the demo centre's key.
const write = () => fs.writeFileSync(cfgFile, JSON.stringify({
    chainId: CHAIN,
    network: "Base Sepolia",
    rpcs: ["https://base-sepolia-rpc.publicnode.com", "https://base-sepolia.gateway.tenderly.co", "https://sepolia.base.org"],
    eas: EAS,
    graphql: "https://base-sepolia.easscan.org/graphql",
    explorer: "https://base-sepolia.easscan.org",
    schemas: { recognition: uidOf(SCHEMAS.recognition), revocation: uidOf(SCHEMAS.revocation) },
    roots: [{ address: root.address, label: by }],
    demoIssuer: { address: demo.address, privateKey: demo.privateKey, name, place, recognitionUid: recognition.uid, note: "Published on purpose so anyone can try issuing; a real centre's key never leaves its browser." }
}, null, 2) + "\n")
write()

// The revoked fixture: issued by the demo centre, unbound (a printed card), then revoked for good.
const fixture = path.join(ROOT, "test/fixtures/revoked.txt")
if (!fs.existsSync(fixture)) {
    const { credential, jti } = await issue({ chainId: CHAIN, issuerKey: demo.privateKey, issuerAddress: demo.address, learning: { course: "English, Level 2 (issued in error)", completedOn: "2026-09-30" }, learner: { name: "Test Learner" } })
    const r = await attest(demo, SCHEMAS.revocation, ethers.ZeroAddress, ["bytes32"], [credentialId(jti)], false)
    fs.mkdirSync(path.dirname(fixture), { recursive: true })
    fs.writeFileSync(fixture, await present({ chainId: CHAIN, credential, reveal: { name: true } }))
    console.log(`revoked fixture ${jti}: ${r.uid}`)
}
console.log("wrote src/config.json")
