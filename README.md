# Bekal

Learning records refugees carry themselves. An idea for the **Idea Track** of *From Vision to Impact: Building Web3 for Social Good 2026* (SMU, GSR Foundation, UMA on DoraHacks), with a working prototype.

*Bekal* is Indonesian for the provisions you take on a journey: here, proof of what a refugee has learned, held by the learner, checkable by any school, scholarship or employer, and never written to a blockchain about them.

**Live prototype:** https://bekal-three.vercel.app (Base Sepolia, a test network) · **Proposal:** [`docs/PROPOSAL.md`](docs/PROPOSAL.md) · **DoraHacks fields:** [`docs/SUBMISSION.md`](docs/SUBMISSION.md)

## Try it

1. Open [`/wallet`](https://bekal-three.vercel.app/wallet) on a phone: it makes a key on the device and shows *My wallet code*.
2. On [`/issuer`](https://bekal-three.vercel.app/issuer), as the demo learning centre, write what was learned (and, optionally, the learner's name), paste or scan the wallet code, and sign. Scan the code it shows with the phone: the record is in the wallet.
3. In the wallet, press **Show**, choose what to reveal, and let someone open the code on [`/verify`](https://bekal-three.vercel.app/verify).

## What is real

| Part | What it does |
|---|---|
| `src/lib/credential.ts` | Learning records as **SD-JWT VCs** (IETF draft-ietf-oauth-sd-jwt-vc, RFC 9901) through the OpenWallet Foundation's `@sd-jwt/sd-jwt-vc`. The learner's name and birth year are selectively disclosable (the centre signs only salted hashes). A record is **bound to the learner's wallet key** (`cnf`), so showing it needs a fresh Key Binding JWT from that wallet, valid 15 minutes; a printed card for a learner without a phone is unbound, like paper. `verify` checks the issuer signature and every disclosed claim, the key binding and its `sd_hash`, then the registry |
| `src/lib/crypto.ts` | Keys on secp256k1, so a centre's key is also an Ethereum address (`did:pkh`). Signatures are standard JOSE **ES256K** (RFC 8812); a verifier recovers the public key from the signature and compares addresses, so no key server is needed |
| `src/lib/registry.ts`, `src/lib/schemas.ts`, `scripts/setup.mjs` | The **issuer registry on the Ethereum Attestation Service** (Base Sepolia predeploys, no contract of ours). Two schemas: a centre's *recognition* by a trusted body (revocable) and a record's *withdrawal* by its centre (permanent, naming only the hash of the record's random id). Candidates come from the keyless EAS indexer, and each one used is **read again from the EAS contract** (`getAttestation`) over public RPCs, so the indexer can hide an attestation but never fake one |
| `src/issuer`, `src/wallet`, `src/verify` | The three pages (Svelte 5, Vite). Records travel as QR codes of links (`/wallet#c=…`, `/verify#p=…`) that any phone camera opens; the part after `#` never reaches a server, and the pages clear it from the address bar. The verifier also reads a pasted link or a photo of a QR code (jsQR). Keys and records live in IndexedDB on the device |
| `public/sw.js` | The wallet works offline: pages and assets are cached as they load, and a record can be shown (signed on the phone) with no network |
| `vercel.json` | A strict Content-Security-Policy (scripts only from this site; network only to the EAS indexer and the public RPCs), `no-referrer`, no framing, camera only for this site |

**Honest limits.** The demo centre's key is published on purpose so anyone can try issuing, and it is recognised by the prototype's own test key (`roots` in `src/config.json`), which says on-chain that it is not an accrediting body; a pilot needs a real recognising body. A withdrawal reaches the EAS indexer about a minute after it is made. Showing a record is one-way (QR), so the wallet picks the Key Binding nonce; replay is limited by the 15-minute age and the `sd_hash`. The pages are in English only for now.

## Run and test

```bash
npm ci
npm run dev            # the three pages on http://localhost:5173
npm test               # 9 tests: ES256K signing and recovery, selective disclosure, wallet binding (missing, stolen, expired), a forged claim, a forged disclosure, an unrecognised issuer, a withdrawn record; and against the live registry: the demo centre recognised, a random key not, a fresh record verified end to end, the withdrawn fixture reported withdrawn
npm run e2e            # Playwright on the production build under the production CSP, phone and desktop: issue to a wallet → show with the name hidden → verify; a photo of the QR code; the withdrawn record; a self-made centre, a forged record and a wallet record shown without its wallet; the wallet offline; security headers; axe on every page
npm run check          # strict type check
node scripts/setup.mjs # (once) register the schemas, recognise the demo centre, make the withdrawn fixture; keys go to .env
```

MIT licence. Separate from [Naungan](https://github.com/PugarHuda/naungan) (Tech Track), by the same author.
