# Bekal: learning records refugees carry themselves

Bekal (Indonesian for "provisions for the journey") gives refugee learners a record of what they have learned that they carry themselves, that any school, scholarship or employer can check, and that never puts their identity on a blockchain.

## The social challenge

- **Learning that leaves no trace.** Malaysia hosts about 215,600 refugees and asylum-seekers registered with UNHCR (February 2026), about 126,000 of them Rohingya and about 64,700 children. Refugee children cannot attend public schools at any level, so they learn in about 160 community learning centres that UNHCR recognises. Indonesia hosts 11,909 refugees and asylum-seekers (UNHCR, August 2025), and only 834 refugee children are enrolled in accredited national schools.
- **Records die when people move.** A learning centre keeps its records on paper or in its own files. When a family moves city, when a centre closes for lack of funding, or when a family is resettled years later, the record is lost or cannot be checked. A child repeats grades it has passed; an adult cannot prove the tailoring, IT or English course they finished.
- **The usual fix is dangerous.** One central database of refugees is the obvious answer, and it is the risk: in 2021 Human Rights Watch reported that Rohingya data collected in Bangladesh, including photographs and thumbprints, had been passed to Myanmar, the country they fled (UNHCR disputes this account). People who fled persecution should not need a register of themselves to prove they learned to read.

## Intended users

- **Refugee learners** (children through their parents, youth, adults). Today: paper certificates that are lost, or nothing. With Bekal: a credential wallet on a phone that works offline, with a printed QR card for those who share a phone or have none.
- **Learning centres and NGOs** (issuers). Today: their certificates carry no weight outside the centre. With Bekal: they issue signed credentials in minutes from a browser, and their standing is visible to anyone.
- **Verifiers**: the next learning centre, schools in resettlement countries, online universities and scholarship programmes, employers where refugees may work. Today: phone calls to centres that may have closed, or placement tests from scratch. With Bekal: scan a QR code and check in seconds, even years later and even if the centre is gone.

## The proposed solution

1. **A public registry of who may issue.** A learning centre becomes an issuer when a recognised body vouches for it, for example UNHCR's recognition of learning centres or a consortium of NGOs, as an on-chain attestation (Ethereum Attestation Service). Recognition can be revoked, and the full history stays readable.
2. **Credentials held by the learner, not stored on-chain.** Each credential ("completed Grade 6 mathematics", "English B1", "tailoring level 2") is a verifiable credential in the IETF SD-JWT VC format, signed by the centre's key and kept in the learner's phone wallet, which works offline. Learners without a phone of their own get it as a printed QR card instead. Nothing about the learner (no name, no UNHCR number, no nationality) is written to the blockchain.
3. **Show only what is needed.** The learner chooses what to reveal. With selective disclosure (SD-JWT VC), they can show "completed Grade 6 at a recognised centre" without their name or birth year, which the centre signed only as salted hashes; they reveal their name only to a verifier they trust, such as a resettlement school. The centre is always shown: it is what makes the record worth trusting.
4. **Records that outlive the centre.** Verification needs only the credential and the public registry, so it still works when the centre has closed, its staff have left, or the learner is on another continent. Revocation (a credential issued in error) is a public status list, not a database of people.
5. **Recovery without a central copy.** If the phone is lost, which is common, the learner restores their wallet from a backup file they keep somewhere safe (a relative's phone, a USB stick), or the centre issues the record again to a new wallet; no one keeps a master list.

## How Web3 adds meaningful value

- **No single authority to trust or to fear.** The government that persecuted the learner, the host government that does not recognise refugees, and an aid agency's database are all poor holders of this record. A public registry of issuers and their standing needs none of them.
- **Permanence that informal schools cannot provide.** Many learning centres depend on short-term funding. Their recognition and their signing keys live on a public chain, so their credentials stay checkable after they close.
- **Verifiable without contacting anyone.** A school in Canada or an online university checks a credential against the chain in seconds, instead of reaching a centre in Kuala Lumpur that may no longer exist.
- **Tamper-evident, and withdrawals are public.** Every claim is covered by the centre's signature, so a changed course or a swapped name fails the check; when a centre withdraws a record, the withdrawal is a permanent public attestation that names only the hash of the record's random id.
- **Built on open standards.** IETF SD-JWT VC (the format of the EU digital identity wallet) and EAS mean any wallet or verifier can take part, and the system is not locked to one company.

## What exists, and what is different

- **European Qualifications Passport for Refugees** (Council of Europe): credentials evaluators interview refugees and assess their prior qualifications; about 337 passports had been issued by mid-2019. It recognises past higher education after the fact. Bekal records learning as it happens, in informal centres, including children and non-formal skills.
- **Blockchain certificate pilots for refugees** (Path Foundation's #BlockchainEducationalPassport, 2018; ODEM with InternetBar.org, 2018; academic designs such as an Ethereum certificate system in IEEE, 2025) put certificates or their hashes on a chain or depend on one platform. Bekal keeps every learner record off-chain and in the learner's hands, puts only the registry of recognised issuers and anonymous withdrawals on-chain, adds selective disclosure and wallet binding, and works offline with a printed fallback.

## Potential social impact

- Children placed at the right grade when they move centre, instead of repeating years.
- Adults able to prove skills for the work, study or volunteering open to them, and to build a record before resettlement.
- Resettled refugees entering schools and universities with evidence they already learned, sooner.
- Learning centres gaining credibility with funders, because what they teach becomes countable and verifiable.
- Measured in a pilot by: learners holding portable records, transfers where prior learning was accepted without retesting, credentials accepted by verifiers outside the centre, and phones lost with records recovered.

## Feasibility and path to a pilot

- **Pilot:** two or three UNHCR-recognised learning centres in Kuala Lumpur, or refugee communities in Medan or Makassar, with one verifier that accepts transfers (another centre).
- **Cost:** credentials are off-chain and free to issue; registry updates and withdrawals cost a fraction of a cent each on an Ethereum layer 2 such as Base.
- **Risks and answers:** a fake issuer (only vouched issuers count, and vouching is revocable); coercion to reveal (the learner holds the credential and chooses what to show; there is no database to raid); lost phones (printed card and recovery); legal and ethical review (no personal data on-chain, informed consent at issuance, following the data-minimisation principle of the ICRC Handbook on Data Protection in Humanitarian Action).
- **Next, in the prototype phase:** field-test the three pages with a real learning centre and its learners (the languages they read, shared phones, printing), and replace the prototype's own recognition key with a real recognising body.

## Working prototype (already built)

Live at https://bekal-three.vercel.app, on Base Sepolia (a test network):

- **Centre page** (`/issuer`): signs a learning record in the browser as an SD-JWT VC (IETF SD-JWT VC, RFC 9901 selective disclosure, the OpenWallet Foundation's library) with an ES256K key; the learner's name and birth year are selectively disclosable; the record is bound to the learner's wallet key, or issued as a printed card. A centre withdraws a record with an EAS attestation.
- **Learner wallet** (`/wallet`): makes its key on the phone, receives a record by scanning a QR code (a link whose part after # never reaches a server), lets the learner tick what to reveal, and shows a QR code valid for 15 minutes, signed by the wallet. Works offline; backup and restore to a file.
- **Verifier** (`/verify`): scans a QR code, a photo of one, or a pasted link, and checks the centre's signature and every shown claim, the wallet's proof, the centre's recognition, and withdrawals.
- **Registry on the Ethereum Attestation Service**: two schemas (a centre's recognition, revocable; a record's withdrawal, permanent). The verifier finds attestations through the EAS indexer and reads each one again from the EAS contract itself, so the indexer can never make a centre look recognised.
- **A public demo centre** whose key is published so anyone can try the full path, recognised by the prototype's own test key, which says it is not an accrediting body. A centre made on the page shows what an unrecognised key looks like.
- **Tested:** unit tests for the signatures, disclosures, wallet binding and tampering, tests against the live registry, and Playwright tests of the whole path in a real browser under the production security policy, including a forged record, a withdrawn record, a stolen wallet record, a photo of a QR code, offline use and accessibility.

## Team

Pugar Huda Mantoro (solo), who built [Naungan](https://dorahacks.io/build/50178) in this hackathon's Tech Track: anonymous membership with zero-knowledge proofs (Semaphore), EAS attestations and an offline phone web app, live on Base. Bekal reuses that experience; it is a separate idea, for a different problem.

## Sources

- UNHCR Malaysia, figures at a glance (February 2026): https://www.unhcr.org/my/node/26257
- UNHCR Malaysia Help, education and learning centres: https://help.unhcr.org/malaysia/education
- New Straits Times, "Rohingya make up largest refugee group in Malaysia" (June 2026): https://www.nst.com.my/amp/news/nation/2026/06/1460472/rohingya-make-largest-refugee-group-malaysia-unhcr-says
- UNHCR Indonesia, Monthly Statistical Report, August 2025: https://www.unhcr.org/id/sites/id/files/2025-10/Monthly%20Statistical%20Report%20August%202025.pdf
- Human Rights Watch, "UN Shared Rohingya Data Without Informed Consent", 15 June 2021: https://www.hrw.org/news/2021/06/15/un-shared-rohingya-data-without-informed-consent
- Council of Europe, "Almost 200 European Qualifications Passports for Refugees issued so far" (2018): https://www.coe.int/web/migration-and-refugees/newsletter-november-2018/-/asset_publisher/cVKOAoroBOtI/content/almost-200-european-qualifications-passports-for-refugees-issued-so-far
- Council of Europe, EQPR evaluation sessions in Italy (July 2019): https://www.coe.int/web/migration-and-refugees/newsletter-july-2019/-/asset_publisher/cVKOAoroBOtI/content/european-qualifications-passport-for-refugees-evaluation-sessions-in-italy-and-live-debate
- University of Northampton, #BlockchainEducationalPassport challenge winner (2018): https://www.northampton.ac.uk/news/blockchaineducationalpassport-challenge-winner-announced/
- ODEM and InternetBar.org Institute, digital credentials for refugees (2018): https://www.streetinsider.com/Press+Releases/ODEM%2C+IBO+Partner+to+Provide+Digital+Credentials+to+Refugees/14456119.html
- IEEE conference paper on an Ethereum refugee certificate system (2025): https://ieeexplore.ieee.org/document/10915462
