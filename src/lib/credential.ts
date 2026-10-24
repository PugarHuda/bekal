// A learning record as an SD-JWT VC (IETF draft-ietf-oauth-sd-jwt-vc, RFC 9901 selective disclosure), through the
// OpenWallet Foundation's @sd-jwt/sd-jwt-vc. The learner's name and birth year are selectively disclosable: the issuer
// signs only their salted hashes, and the learner decides, per presentation, whether to reveal them. What was learned
// is always shown: it is the point of the record. Bound to the learner's wallet key (cnf), so a presentation needs a
// fresh Key Binding JWT from that wallet; a printed card for a learner without a phone is unbound, like paper.
import { SDJwtVcInstance } from "@sd-jwt/sd-jwt-vc"
import { addressOfDid, addressOfJwk, didOf, fromB64u, hasher, jwkOf, saltGenerator, signedBy, signer } from "./crypto.ts"

export const VCT = "urn:bekal:learning-record:v1"
export const KB_AUDIENCE = "bekal-verifier"
export const KB_MAX_AGE = 15 * 60 // a presentation is good for 15 minutes, then the learner shows a fresh one

export type Learning = {
    course: string
    level?: string
    hours?: number
    completedOn: string // YYYY-MM-DD
    centreRef?: string // the centre's own record number, not the learner's identity
}
export type Learner = { name?: string; birthYear?: number }

/** What the issuer signs. The learner block is disclosable claim by claim; nothing else about the learner exists. */
export function claimsOf(learning: Learning, learner: Learner) {
    const learnerClaims = Object.fromEntries(Object.entries(learner).filter(([, v]) => v !== undefined && v !== ""))
    return { achievement: { ...learning }, learner: learnerClaims }
}

const base = { hasher, hashAlg: "sha-256" as const, saltGenerator, signAlg: "ES256K", kbSignAlg: "ES256K" }

/** Issue: the centre's key signs; `holderJwk` binds the record to the learner's wallet (omit for a printed card). */
export async function issue(opts: { chainId: number; issuerKey: string; issuerAddress: string; learning: Learning; learner: Learner; holderJwk?: object; now?: number }) {
    const sd = new SDJwtVcInstance({ ...base, signer: signer(opts.issuerKey) })
    const { achievement, learner } = claimsOf(opts.learning, opts.learner)
    const jti = crypto.randomUUID()
    const payload = {
        iss: didOf(opts.chainId, opts.issuerAddress),
        iat: Math.floor((opts.now ?? Date.now()) / 1000),
        vct: VCT,
        jti,
        achievement,
        learner,
        ...(opts.holderJwk ? { cnf: { jwk: opts.holderJwk } } : {})
    }
    const frame = { learner: { _sd: Object.keys(learner) as never[] } }
    return { credential: await sd.issue(payload, frame as never), jti }
}

/** Present: only the chosen learner claims are disclosed; a bound record gets a fresh Key Binding JWT. */
export async function present(opts: { chainId: number; credential: string; reveal: { name?: boolean; birthYear?: boolean }; holderKey?: string; now?: number }) {
    const sd = new SDJwtVcInstance({ ...base, kbSigner: opts.holderKey ? signer(opts.holderKey) : undefined })
    const frame = { learner: { ...(opts.reveal.name ? { name: true } : {}), ...(opts.reveal.birthYear ? { birthYear: true } : {}) } }
    const bound = !!(await decode(opts.credential)).payload.cnf
    if (bound && !opts.holderKey) throw new Error("this record is bound to a wallet: present it from that wallet")
    return sd.present(opts.credential, frame as never, bound ? { kb: { payload: { iat: Math.floor((opts.now ?? Date.now()) / 1000), aud: KB_AUDIENCE, nonce: saltGenerator(16) } } } : undefined)
}

/** The credential's claims as the holder sees them (all disclosures it carries). */
export async function decode(credential: string) {
    const sd = new SDJwtVcInstance({ hasher, hashAlg: "sha-256" })
    const claims = (await sd.getClaims(credential)) as unknown as Record<string, unknown> & { iss: string; jti: string; iat: number; achievement: Learning; learner?: Learner; cnf?: { jwk: object } }
    return { payload: claims }
}

export type Recognition = { recognised: true; name: string; place: string; by: string; uid: string } | { recognised: false; reason: string }
export type Registry = {
    recognition: (issuer: string) => Promise<Recognition>
    revoked: (issuer: string, jti: string) => Promise<{ revoked: boolean; uid?: string }>
}

export type Verdict = {
    ok: boolean
    signature: boolean
    issuer: string
    recognition: Recognition
    revoked: boolean
    bound: boolean
    keyBinding: "valid" | "none" | "missing"
    achievement?: Learning
    learner?: Learner
    hidden: number // learner claims the credential holds but the learner did not reveal
    issuedAt?: number
    error?: string
}

/**
 * Verify a presentation: the issuer's ES256K signature against the address in `iss`, every disclosed claim against
 * its signed hash, the Key Binding JWT against the learner's key in cnf (fresh, for this audience), then the public
 * registry: is the issuer recognised, and has it revoked this record.
 */
const jwtPart = (jwt: string, i: number) => JSON.parse(new TextDecoder().decode(fromB64u(jwt.split(".")[i])))

export async function verify(presentation: string, registry: Registry, now = Date.now()): Promise<Verdict> {
    let issuer = ""
    const fail = (error: string): Verdict => ({ ok: false, signature: false, issuer, recognition: { recognised: false, reason: "not checked" }, revoked: false, bound: false, keyBinding: "none", hidden: 0, error })
    try {
        const parts = presentation.trim().split("~")
        const head = jwtPart(parts[0], 1)
        issuer = addressOfDid(head.iss)
        const bound = !!head.cnf
        // The wallet picks the nonce (the QR goes one way); replay is limited by the 15-minute age and the sd_hash,
        // which ties the Key Binding JWT to exactly these disclosures.
        const kbJwt = parts.at(-1)
        const kbNonce = bound && kbJwt ? (jwtPart(kbJwt, 1).nonce as string | undefined) : undefined
        if (bound && !kbNonce) return { ...fail("this record is bound to a wallet, and the presentation carries no proof from it"), issuer, bound, keyBinding: "missing" }
        const sd = new SDJwtVcInstance({
            hasher, hashAlg: "sha-256",
            verifier: (data, sig) => signedBy(data, sig, issuer),
            kbVerifier: async (data, sig, payload) => {
                const jwk = (payload as { cnf?: { jwk?: object } }).cnf?.jwk
                return !!jwk && signedBy(data, sig, addressOfJwk(jwk))
            }
        })
        const r = await sd.verify(presentation.trim(), {
            currentDate: Math.floor(now / 1000), allowedIssuerAlgorithms: ["ES256K"], allowedKeyBindingAlgorithms: ["ES256K"], expectedVct: VCT,
            ...(bound ? { keyBindingNonce: kbNonce, expectedKeyBindingAudience: KB_AUDIENCE, keyBindingMaxAgeSeconds: KB_MAX_AGE } : {})
        } as never)
        const p = r.payload as unknown as { jti: string; iat: number; achievement: Learning; learner?: Learner }
        const held = ((head.learner?._sd as string[] | undefined) ?? []).length
        const hidden = Math.max(0, held - Object.keys(p.learner ?? {}).length)
        const [recognition, rev] = await Promise.all([registry.recognition(issuer), registry.revoked(issuer, p.jti)])
        return {
            ok: recognition.recognised && !rev.revoked,
            signature: true, issuer, recognition, revoked: rev.revoked, bound, keyBinding: bound ? "valid" : "none",
            achievement: p.achievement, learner: p.learner, hidden,
            issuedAt: p.iat
        }
    } catch (e) {
        return fail((e as Error).message)
    }
}

export { jwkOf }
