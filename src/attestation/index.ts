/**
 * ERC-8176 descriptor hashing primitives and EAS attestation schema constants.
 *
 * These are the building blocks for verifying that an ERC-7730 descriptor
 * fetched from any source (registry, IPFS, proxy, cache) matches what an
 * auditor cryptographically signed. The library exposes:
 *
 * - {@link canonicalize}            — RFC 8785 JSON canonicalization
 * - {@link computeDescriptorHash}   — keccak256(utf8(JCS(descriptor)))
 * - {@link ERC7730_EAS_SCHEMA_UID}  — canonical EAS schema for ERC-7730 attestations
 *
 * Signature verification (recovering the EAS offchain attester from an
 * EIP-712 signature) is intentionally NOT included here — it requires
 * secp256k1 + EIP-712 hashing dependencies that not all consumers want to
 * pull in. Wallets that need it can call viem's `recoverTypedDataAddress`
 * directly against the EAS offchain envelope.
 */

export { canonicalize } from "./jcs.js";
export { computeDescriptorHash } from "./descriptor-hash.js";

/**
 * Canonical EAS schema UID used by the ERC-7730 attestation flow. Wallets
 * verifying attestations MUST reject signatures bound to any other schema.
 *
 * Schema fields:
 *   bytes32 descriptorHash, string descriptorPath, string note
 *
 * Published in the canonical registry's auditors guide:
 * https://github.com/ethereum/clear-signing-erc7730-registry
 */
export const ERC7730_EAS_SCHEMA_UID =
  "0xe023eef113c1670774801c34b377fdf612dd8a4d2fa92fe382e15bd91fafb5c2" as const;
