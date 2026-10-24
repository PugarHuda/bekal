# Bekal: learning records refugees carry themselves

Bekal (Indonesian for "provisions for the journey") gives refugee learners a record of what they have learned that they carry themselves, that any school, scholarship or employer can check, and that never puts their identity on a blockchain.

Every figure below links to the page it comes from; each was opened and checked on 24 October 2026.

## The social challenge

- **Learning outside any school system.** As of August 2026, 225,740 refugees and asylum-seekers are registered with UNHCR in Malaysia, about 90% of them from Myanmar (Rohingya and other ethnic groups), and 72,236 of them are children ([UNHCR Malaysia, figures at a glance](https://www.unhcr.org/my/node/26257)). Refugee children and youth there "do not have access to public schools at any level"; most learn in informal community learning centres, of which about 160 are recognised by UNHCR, and recognition "does not imply consistent or comprehensive funding" ([UNHCR Malaysia, Education](https://help.unhcr.org/malaysia/education)). Indonesia hosts 12,167 refugees and asylum-seekers, 3,609 of them children ([UNHCR Indonesia, Monthly Statistical Report, June 2026](https://www.unhcr.org/id/sites/id/files/docs/id/2026-08/Monthly%20Statistical%20Report%20June%202026.pdf)).
- **Records that do not travel.** A centre keeps what a child or adult learned on paper or in its own files. When a family moves to another city, when a centre closes, or when a family is resettled years later, there is no record the next school can check, and the learner starts again from a placement test.
- **The usual fix is dangerous.** One central database of refugees is the obvious answer, and it is the risk: in 2021 Human Rights Watch reported that UNHCR registration data on Rohingya refugees in Bangladesh, "including analog photographs, thumbprint images, and other biographic data", was submitted by Bangladesh to the Myanmar government for possible repatriation; UNHCR "denied any wrongdoing" ([Human Rights Watch, 15 June 2021](https://www.hrw.org/news/2021/06/15/un-shared-rohingya-data-without-informed-consent)). People who fled persecution should not need a register of themselves to prove they learned to read.

## Intended users

- **Refugee learners** (children through their parents, youth, adults). Today: paper certificates that are lost, or nothing. With Bekal: a credential wallet on a phone that works offline, or a printed QR card for those who share a phone or have none.
- **Learning centres and NGOs** (issuers). Today: their certificates carry no weight outside the centre. With Bekal: they issue signed records in minutes from a browser, and their standing is visible to anyone.
- **Verifiers**: the next learning centre, schools in resettlement countries, online universities and scholarship programmes, employers where refugees may work. Today: contacting a centre that may have closed, or testing from scratch. With Bekal: scan a QR code and check in seconds, even years later and even if the centre is gone.

## The proposed solution

1. **A public registry of who may issue.** A learning centre becomes an issuer when a recognised body vouches for it (for example UNHCR, which already recognises learning centres, or a consortium of NGOs) with an on-chain attestation on the [Ethereum Attestation Service](https://attest.org). Recognition can be revoked, and its history stays readable.
2. **Records held by the learner, not stored on-chain.** Each record ("completed Grade 6 mathematics", "English B1", "tailoring level 2") is a verifiable credential in the IETF [SD-JWT VC](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/) format, signed by the centre's key and kept in the learner's phone wallet, which works offline. Learners without a phone of their own get it as a printed QR card instead. Nothing about the learner (no name, no UNHCR number, no nationality) is written to the blockchain.
3. **Show only what is needed.** The learner chooses what to reveal. With selective disclosure ([RFC 9901](https://www.rfc-editor.org/rfc/rfc9901.html)), they can show "completed Grade 6 at a recognised centre" without their name or birth year, which the centre signed only as salted hashes, and reveal their name only to a verifier they trust, such as a resettlement school. The centre is always shown: it is what makes the record worth trusting.
4. **Records that outlive the centre.** Checking a record needs only the record and the public registry, so it still works when the centre has closed, its staff have left, or the learner is on another continent. A record issued in error is withdrawn with a public attestation that names only the hash of the record's random id, not a person.
5. **Recovery without a central copy.** If the phone is lost, the learner restores their wallet from a backup file they keep somewhere safe (a relative's phone, a USB stick), or the centre issues the record again to a new wallet; no one keeps a master list.

## How Web3 adds meaningful value

- **No single authority to trust or to fear.** The government the learner fled, a host government that does not recognise refugees, and an aid agency's database are all poor holders of this record. A public registry of issuers and their standing needs none of them.
- **Permanence that informal schools cannot provide.** Learning centres run on uncertain funding ([UNHCR Malaysia](https://help.unhcr.org/malaysia/education)). Their recognition and signing keys live on a public chain, so their records stay checkable after they close.
- **Verifiable without contacting anyone.** A school abroad or an online university checks a record against the chain in seconds, instead of reaching a centre that may no longer exist.
- **Tamper-evident, and withdrawals are public.** Every claim is covered by the centre's signature, so a changed course or a swapped name fails the check; a withdrawal is a permanent public attestation.
- **Built on open standards.** SD-JWT VC is one of the two formats in which the EU Digital Identity Wallet's architecture requires person identification data to be issued ([EUDI ARF, PID rulebook](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/v-pid-rulebook.md)), and EAS is open infrastructure, so any wallet or verifier can take part and no one company is needed.

## What exists, and what is different

- **European Qualifications Passport for Refugees** (Council of Europe): credentials evaluators assess refugees' prior qualifications "based on available documentation and a structured interview"; almost 200 passports had been issued by November 2018 ([Council of Europe](https://www.coe.int/web/migration-and-refugees/newsletter-november-2018/-/asset_publisher/cVKOAoroBOtI/content/almost-200-european-qualifications-passports-for-refugees-issued-so-far)), and a July 2019 session in Italy issued 39 more ([Council of Europe](https://www.coe.int/web/migration-and-refugees/newsletter-july-2019/-/asset_publisher/cVKOAoroBOtI/content/european-qualifications-passport-for-refugees-evaluation-sessions-in-italy-and-live-debate)). It assesses past qualifications after the fact. Bekal records learning as it happens, in informal centres, including children and non-formal skills.
- **Blockchain credential efforts for refugees**: the Path Foundation won the UN #BlockchainEducationalPassport challenge for a solution that captures and verifies education and work experience ([University of Northampton](https://www.northampton.ac.uk/news/blockchaineducationalpassport-challenge-winner-announced/)); ODEM and the InternetBar.org Institute announced blockchain-based educational credentials for displaced people in August 2018 ([press release](https://www.streetinsider.com/Press+Releases/ODEM%2C+IBO+Partner+to+Provide+Digital+Credentials+to+Refugees/14456119.html)); and an IEEE conference paper describes a "Blockchain-Based Certificate Generation and Validation System for Refugees" ([IEEE Xplore](https://ieeexplore.ieee.org/document/10915462)). Bekal keeps every learner record off-chain and in the learner's hands, puts only the registry of recognised issuers and anonymous withdrawals on-chain, adds selective disclosure and wallet binding, and works offline with a printed fallback.

## Potential social impact

- Children placed at the right level when they move centre, instead of starting again.
- Adults able to prove skills for the study, training or work open to them, and to build a record before resettlement.
- Resettled refugees entering schools and universities with evidence of what they already learned.
- Learning centres gaining credibility with funders, because what they teach becomes countable and verifiable.
- Measured in a pilot by: learners holding portable records, transfers where prior learning was accepted without retesting, records accepted by verifiers outside the centre, and lost phones whose records were recovered.

## Feasibility and path to a pilot

- **Pilot:** two or three UNHCR-recognised learning centres in Malaysia, or refugee communities in Indonesia, with one verifier that accepts transfers (another centre).
- **Cost:** records are off-chain and free to issue. On the prototype, a centre's recognition used 439,912 gas and a withdrawal 190,201 gas ([recognition](https://sepolia.basescan.org/tx/0xfecac1dadc0bd87f232ac0a9f8858415c59d1d372d90974d59e78a8ea448c188), [withdrawal](https://sepolia.basescan.org/tx/0xd9fa587e3689dc6c45f8020fafeeac49a2a0764679fe8f0f4be3f6d748311b02)); at the Base mainnet prices measured by the author's Naungan dashboard on 23 October 2026 (about $0.005 for 343,464 gas), each is under one US cent.
- **Risks and answers:** a fake issuer (only vouched issuers count, and vouching is revocable); coercion to reveal (the learner holds the record and chooses what to show; there is no database to raid); lost phones (printed card, backup file, re-issue); legal and ethical review (no personal data on-chain, informed consent at issuance, following the [ICRC Handbook on Data Protection in Humanitarian Action](https://www.icrc.org/en/data-protection-humanitarian-action-handbook)).
- **Next, in the prototype phase:** field-test the three pages with a real learning centre and its learners (the languages they read, shared phones, printing), and replace the prototype's own recognition key with a real recognising body.

## Working prototype (already built)

Live at https://bekal-three.vercel.app on Base Sepolia (a test network); source at https://github.com/PugarHuda/bekal (MIT).

- **Centre page** (`/issuer`): signs a learning record in the browser as an SD-JWT VC with an ES256K key, using the OpenWallet Foundation's [`@sd-jwt/sd-jwt-vc`](https://www.npmjs.com/package/@sd-jwt/sd-jwt-vc); the learner's name and birth year are selectively disclosable; the record is bound to the learner's wallet key, or issued as a printed card. A centre withdraws a record with an EAS attestation.
- **Learner wallet** (`/wallet`): makes its key on the phone, receives a record by scanning a QR code (a link whose part after # never reaches a server), lets the learner tick what to reveal, and shows a QR code valid for 15 minutes, signed by the wallet. Works offline; backup and restore to a file.
- **Verifier** (`/verify`): scans a QR code, a photo of one, or a pasted link, and checks the centre's signature and every shown claim, the wallet's proof, the centre's recognition, and withdrawals.
- **Registry on the Ethereum Attestation Service**: two schemas (a centre's recognition, revocable; a record's withdrawal, permanent). The verifier finds attestations through the EAS indexer and reads each one again from the EAS contract itself, so the indexer can never make a centre look recognised. The demo centre's recognition: [on EAS](https://base-sepolia.easscan.org/attestation/view/0xcb0bba1ace69b2cf601fc3826d487eba9c40f87fc7ee599fb6a78675a86a679d).
- **A public demo centre** whose key is published so anyone can try the full path, recognised by the prototype's own test key, which says on-chain that it is not an accrediting body. A centre made on the page shows what an unrecognised key looks like.
- **Tested:** unit tests for the signatures, disclosures, wallet binding and tampering, tests against the live registry, and Playwright tests of the whole path in a real browser under the production security policy (a forged record, a withdrawn record, a wallet record shown without its wallet, a photo of a QR code, offline use, accessibility), in CI on every push.

## Team

Pugar Huda Mantoro (solo), who built [Naungan](https://dorahacks.io/build/50178) in this hackathon's Tech Track: anonymous membership with zero-knowledge proofs (Semaphore), EAS attestations and an offline phone web app, live on Base Sepolia. Bekal reuses that experience; it is a separate idea, for a different problem.
