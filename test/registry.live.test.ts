// Against the live chain (Base Sepolia EAS and its indexer): the registry scripts/setup.mjs wrote.
import fs from "node:fs"
import { describe, expect, it } from "vitest"
import { Wallet } from "ethers"
import config from "../src/config.json"
import { registry } from "../src/lib/registry.ts"
import { issue, present, verify } from "../src/lib/credential.ts"

describe("issuer registry on EAS (live)", { timeout: 60e3 }, () => {
    it("recognises the demo centre, as the chain says, with who vouched for it", async () => {
        const r = await registry.recognition(config.demoIssuer.address)
        expect(r).toMatchObject({ recognised: true, name: config.demoIssuer.name, place: config.demoIssuer.place, uid: config.demoIssuer.recognitionUid })
        if (r.recognised) expect(r.by).toMatch(/not an accrediting body/)
    })

    it("does not recognise a key nobody vouched for", async () => {
        expect(await registry.recognition(Wallet.createRandom().address)).toMatchObject({ recognised: false })
    })

    it("a fresh record from the demo centre verifies end to end; the revoked fixture is reported revoked", async () => {
        const { credential } = await issue({ chainId: config.chainId, issuerKey: config.demoIssuer.privateKey, issuerAddress: config.demoIssuer.address, learning: { course: "Tailoring, Level 1", completedOn: "2026-10-20" }, learner: { name: "A Learner" } })
        expect(await verify(await present({ chainId: config.chainId, credential, reveal: {} }), registry)).toMatchObject({ ok: true, signature: true, revoked: false, recognition: { recognised: true } })
        const revoked = fs.readFileSync(new URL("./fixtures/revoked.txt", import.meta.url), "utf8")
        expect(await verify(revoked, registry)).toMatchObject({ ok: false, signature: true, revoked: true, learner: { name: "Test Learner" } })
    })

    it("with no RPC that serves wide log ranges, the EAS indexer still finds the recognition and the withdrawal", { timeout: 150e3 }, async () => {
        const saved = config.logRpcs
        config.logRpcs = ["https://invalid.example"]
        try {
            expect(await registry.recognition(config.demoIssuer.address)).toMatchObject({ recognised: true })
            const revoked = fs.readFileSync(new URL("./fixtures/revoked.txt", import.meta.url), "utf8")
            let v = await verify(revoked, registry)
            for (let i = 0; i < 10 && !v.revoked; i++) { // the indexer trails the chain by up to a minute
                await new Promise((r) => setTimeout(r, 10e3))
                v = await verify(revoked, registry)
            }
            expect(v).toMatchObject({ revoked: true, ok: false })
        } finally {
            config.logRpcs = saved
        }
    })
})
