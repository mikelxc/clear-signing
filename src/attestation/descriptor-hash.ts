/**
 * ERC-8176 descriptor hash. Computed over the JCS-canonicalized JSON of the
 * descriptor — auditors sign EAS attestations against this hash, so wallets
 * MUST canonicalize before hashing.
 *
 *   descriptorHash = keccak256(utf8(JCS(descriptor)))
 *
 * Output is a 0x-prefixed 32-byte hex string (`0x${64-hex-chars}`),
 * matching the form EAS attestations carry as the subject reference.
 */

import { keccak_256 } from "@noble/hashes/sha3";

import { canonicalize } from "./jcs.js";

const toHex = (bytes: Uint8Array): `0x${string}` => {
  let out = "0x";
  for (const b of bytes) {
    out += b.toString(16).padStart(2, "0");
  }
  return out as `0x${string}`;
};

const utf8 = new TextEncoder();

/**
 * Compute the ERC-8176 descriptor hash for a parsed ERC-7730 descriptor.
 *
 * Accepts the parsed JSON object — we deliberately don't accept a raw string
 * because RFC 8785 canonicalization is on the *value*, not the byte sequence.
 *
 * @example
 * import { computeDescriptorHash } from "@ethereum-sourcify/clear-signing";
 * const hash = computeDescriptorHash(JSON.parse(descriptorJson));
 * // => "0x..."
 */
export const computeDescriptorHash = (descriptor: unknown): `0x${string}` =>
  toHex(keccak_256(utf8.encode(canonicalize(descriptor))));
