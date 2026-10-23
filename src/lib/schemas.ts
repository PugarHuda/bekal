// The two EAS schemas the registry uses (registered by scripts/setup.mjs, no resolver). Nothing about a learner is in
// either: recognition is about a centre, and a revocation holds only the hash of a credential's random id.
import { keccak256, toUtf8Bytes } from "ethers"

export const SCHEMAS = {
    /** A recognised body vouches for a learning centre's key (recipient = the centre). Revocable: recognition can end. */
    recognition: { schema: "string centreName,string place,string recognisedBy", revocable: true },
    /** A centre withdraws one of its records (attester = the centre). Permanent: a revoked record stays revoked. */
    revocation: { schema: "bytes32 credentialId", revocable: false }
}

/** What a revocation names: the hash of the record's random jti, which reveals nothing about the learner. */
export const credentialId = (jti: string) => keccak256(toUtf8Bytes(`bekal:${jti}`))
