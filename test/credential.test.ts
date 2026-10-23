import { describe, expect, it } from "vitest"
import { Wallet } from "ethers"
import { decode, issue, jwkOf, present, verify, type Registry } from "../src/lib/credential.ts"
import { addressOfJwk, signedBy, signer } from "../src/lib/crypto.ts"

const CHAIN = 84532
const centre = Wallet.createRandom()
const learnerWallet = Wallet.createRandom()
const learning = { course: "Mathematics, Grade 6", level: "Completed", hours: 120, completedOn: "2026-10-01", centreRef: "KL-2026-0142" }
const learner = { name: "Nur Aisyah", birthYear: 2013 }

// The registry as the chain would answer: this centre recognised, nothing revoked unless listed.
const registry = (revoked: string[] = [], recognised = [centre.address]): Registry => ({
    recognition: async (a) => recognised.includes(a) ? { recognised: true, name: "Test Learning Centre", place: "Kuala Lumpur", by: "0xroot", uid: "0xuid" } : { recognised: false, reason: "no recognition on the registry" },
    revoked: async (_a, jti) => ({ revoked: revoked.includes(jti) })
})

describe("ES256K keys and signatures", () => {
    it("signs standard JOSE ES256K and recovers the signer's address, nobody else's", async () => {
        const sig = await signer(centre.privateKey)("header.payload")
        expect(sig).toMatch(/^[A-Za-z0-9_-]{86}$/) // 64 bytes, base64url
        expect(await signedBy("header.payload", sig, centre.address)).toBe(true)
        expect(await signedBy("header.payload", sig, learnerWallet.address)).toBe(false)
        expect(await signedBy("header.payloaX", sig, centre.address)).toBe(false)
    })
    it("turns a key into a secp256k1 JWK and back into the same address", () => {
        expect(addressOfJwk(jwkOf(learnerWallet.privateKey))).toBe(learnerWallet.address)
        expect(() => addressOfJwk({ kty: "EC", crv: "P-256", x: "a", y: "b" })).toThrow(/secp256k1/)
    })
})

describe("learning record (SD-JWT VC)", () => {
    it("bound to the wallet: the learner shows the course and hides their name; the verifier sees exactly that", async () => {
        const { credential, jti } = await issue({ chainId: CHAIN, issuerKey: centre.privateKey, issuerAddress: centre.address, learning, learner, holderJwk: jwkOf(learnerWallet.privateKey) })
        expect(credential.split("~")).toHaveLength(4) // JWT, two disclosures, no KB yet
        expect(credential).not.toContain("Nur Aisyah") // only salted digests are signed; the names travel in disclosures
        const held = await decode(credential)
        expect(held.payload.learner).toEqual(learner)
        expect(held.payload.jti).toBe(jti)

        const p = await present({ chainId: CHAIN, credential, reveal: { birthYear: true }, holderKey: learnerWallet.privateKey })
        const v = await verify(p, registry())
        expect(v).toMatchObject({ ok: true, signature: true, revoked: false, bound: true, keyBinding: "valid", issuer: centre.address })
        expect(v.achievement).toEqual(learning)
        expect(v.learner).toEqual({ birthYear: 2013 })
        expect(v.hidden).toEqual(["1 learner detail"])
        expect(p).not.toMatch(/Nur Aisyah/)
        expect(JSON.stringify(v)).not.toContain("Nur Aisyah")
    })

    it("refuses a bound record shown without the wallet, from another wallet, or after 15 minutes", async () => {
        const { credential } = await issue({ chainId: CHAIN, issuerKey: centre.privateKey, issuerAddress: centre.address, learning, learner, holderJwk: jwkOf(learnerWallet.privateKey) })
        await expect(present({ chainId: CHAIN, credential, reveal: {} })).rejects.toThrow(/bound to a wallet/)
        const stripped = (await present({ chainId: CHAIN, credential, reveal: {}, holderKey: learnerWallet.privateKey })).replace(/~[^~]+$/, "~")
        expect(await verify(stripped, registry())).toMatchObject({ ok: false, keyBinding: "missing" })
        const thief = await present({ chainId: CHAIN, credential, reveal: {}, holderKey: Wallet.createRandom().privateKey })
        expect((await verify(thief, registry())).ok).toBe(false)
        const old = await present({ chainId: CHAIN, credential, reveal: {}, holderKey: learnerWallet.privateKey, now: Date.now() - 16 * 60e3 })
        expect((await verify(old, registry())).ok).toBe(false)
    })

    it("catches a forged claim, a forged disclosure and a record signed by someone else", async () => {
        const { credential } = await issue({ chainId: CHAIN, issuerKey: centre.privateKey, issuerAddress: centre.address, learning, learner })
        const p = await present({ chainId: CHAIN, credential, reveal: { name: true } })
        expect((await verify(p, registry())).ok).toBe(true) // unbound: a printed card
        // Change the course inside the signed JWT.
        const [jwt, ...rest] = p.split("~")
        const [h, body, sig] = jwt.split(".")
        const forged = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/")))
        forged.achievement.course = "Medicine, Year 6"
        const b64 = btoa(JSON.stringify(forged)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
        expect(await verify([`${h}.${b64}.${sig}`, ...rest].join("~"), registry())).toMatchObject({ ok: false, signature: false })
        // Swap the name disclosure for one the issuer never signed.
        const fake = btoa(JSON.stringify(["salt", "name", "Someone Else"])).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
        expect((await verify([jwt, fake, ""].join("~"), registry())).ok).toBe(false)
        // A self-made "centre": valid signature, not recognised on the registry.
        const rogue = Wallet.createRandom()
        const r = await issue({ chainId: CHAIN, issuerKey: rogue.privateKey, issuerAddress: rogue.address, learning, learner })
        const rv = await verify(await present({ chainId: CHAIN, credential: r.credential, reveal: {} }), registry())
        expect(rv).toMatchObject({ ok: false, signature: true, recognition: { recognised: false } })
    })

    it("reports a revoked record as not valid, with its signature still checking out", async () => {
        const { credential, jti } = await issue({ chainId: CHAIN, issuerKey: centre.privateKey, issuerAddress: centre.address, learning, learner: {} })
        const v = await verify(await present({ chainId: CHAIN, credential, reveal: {} }), registry([jti]))
        expect(v).toMatchObject({ ok: false, signature: true, revoked: true, hidden: [] })
    })
})
