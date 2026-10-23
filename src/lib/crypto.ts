// Keys and signatures for SD-JWT VC, on secp256k1 so a key is also an Ethereum address (the issuer registry on EAS is
// keyed by address). Signatures are standard JOSE ES256K (RFC 8812): ECDSA over the SHA-256 of the signing input, r‖s,
// base64url. A verifier needs no key server: it recovers the public key from the signature and compares addresses.
import { SigningKey, Wallet, computeAddress, getBytes, hexlify, Signature } from "ethers"

const enc = new TextEncoder()

export const b64u = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
export const fromB64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), (c) => c.charCodeAt(0))

export async function sha256(data: string | ArrayBuffer | Uint8Array): Promise<Uint8Array> {
    const bytes = typeof data === "string" ? enc.encode(data) : new Uint8Array(data) // a copy on its own ArrayBuffer
    return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
}

/** SD-JWT's hasher callback: only sha-256 is offered, so a credential naming anything else fails. */
export const hasher = async (data: string | ArrayBuffer, alg: string) => {
    if (alg.toLowerCase() !== "sha-256") throw new Error(`unsupported hash ${alg}`)
    return sha256(data)
}

export const saltGenerator = (length: number) => b64u(crypto.getRandomValues(new Uint8Array(length)))

/** did:pkh for an address on a chain (CAIP-10), the issuer and holder identifier in credentials. */
export const didOf = (chainId: number, address: string) => `did:pkh:eip155:${chainId}:${address}`
export function addressOfDid(did: string): string {
    const m = /^did:pkh:eip155:\d+:(0x[0-9a-fA-F]{40})$/.exec(did)
    if (!m) throw new Error(`not a did:pkh address: ${did}`)
    return m[1]
}

/** JOSE ES256K signer for a private key (hex). */
export const signer = (privateKey: string) => async (data: string) => {
    const sig = new SigningKey(privateKey).sign(await sha256(data))
    return b64u(getBytes(sig.r + sig.s.slice(2)))
}

/** The addresses an ES256K signature could come from (one per recovery id). */
export async function signers(data: string, sig: string): Promise<string[]> {
    const raw = fromB64u(sig)
    if (raw.length !== 64) return []
    const digest = await sha256(data)
    const r = hexlify(raw.slice(0, 32)), s = hexlify(raw.slice(32))
    const out: string[] = []
    for (const v of [27, 28]) {
        try {
            out.push(computeAddress(SigningKey.recoverPublicKey(digest, Signature.from({ r, s, v }))))
        } catch {}
    }
    return out
}

export const signedBy = async (data: string, sig: string, address: string) => (await signers(data, sig)).some((a) => a.toLowerCase() === address.toLowerCase())

/** Public key as a JWK (EC secp256k1), for a credential's cnf (holder binding). */
export function jwkOf(privateOrPublicKey: string) {
    const pub = getBytes(privateOrPublicKey.length === 66 ? new SigningKey(privateOrPublicKey).publicKey : SigningKey.computePublicKey(privateOrPublicKey, false))
    return { kty: "EC", crv: "secp256k1", x: b64u(pub.slice(1, 33)), y: b64u(pub.slice(33, 65)) }
}
export function addressOfJwk(jwk: { kty?: string; crv?: string; x?: string; y?: string }): string {
    if (jwk.kty !== "EC" || jwk.crv !== "secp256k1" || !jwk.x || !jwk.y) throw new Error("holder key is not an EC secp256k1 JWK")
    const x = fromB64u(jwk.x), y = fromB64u(jwk.y)
    if (x.length !== 32 || y.length !== 32) throw new Error("holder key has the wrong length")
    return computeAddress(hexlify(new Uint8Array([4, ...x, ...y])))
}

export const newKey = () => Wallet.createRandom().privateKey
