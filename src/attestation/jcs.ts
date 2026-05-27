/**
 * RFC 8785 JSON Canonicalization Scheme (JCS) — produces a canonical UTF-8
 * byte representation of a JSON value, suitable for cryptographic hashing.
 *
 * ERC-8176 (the descriptor-hash standard used by ERC-7730 EAS attestations)
 * specifies that the hash MUST be computed on the canonical form, not raw
 * file bytes, so two semantically identical descriptors with different
 * whitespace / key ordering / number formatting hash to the same value.
 *
 * Spec: https://datatracker.ietf.org/doc/html/rfc8785
 * Test vectors: https://github.com/cyberphone/json-canonicalization
 *
 * We hand-roll rather than pulling another dep because JCS is small
 * (~80 LOC) and deterministic. Number serialization uses ECMAScript
 * ToString (which RFC 8785 references) — this matches `JSON.stringify(n)`
 * for every IEEE 754 double except a handful of edge cases involving very
 * small / very large magnitudes that don't show up in descriptor payloads
 * (no NaN, ±Infinity, no exponents in canonical form for representable
 * integers within Number.MAX_SAFE_INTEGER).
 */

const escapeChar = (codepoint: number): string => {
  switch (codepoint) {
    case 0x08:
      return "\\b";
    case 0x09:
      return "\\t";
    case 0x0a:
      return "\\n";
    case 0x0c:
      return "\\f";
    case 0x0d:
      return "\\r";
    case 0x22:
      return '\\"';
    case 0x5c:
      return "\\\\";
    default:
      return `\\u${codepoint.toString(16).padStart(4, "0")}`;
  }
};

const canonicalString = (s: string): string => {
  let out = '"';
  for (let i = 0; i < s.length; i += 1) {
    const code = s.charCodeAt(i);
    if (code < 0x20 || code === 0x22 || code === 0x5c) {
      out += escapeChar(code);
    } else {
      out += s.charAt(i);
    }
  }
  return out + '"';
};

const canonicalNumber = (n: number): string => {
  if (!Number.isFinite(n)) {
    throw new Error(`JCS: non-finite number ${n}`);
  }
  // ECMAScript ToString already matches JCS for finite numbers.
  // RFC 8785 §3.2.2.2: serialize negative zero as "0", not "-0".
  if (Object.is(n, -0)) return "0";
  return String(n);
};

// Sort object keys by their UTF-16 code units (RFC 8785 §3.2.3).
const sortKeysLex = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

/**
 * Canonicalize a JSON value per RFC 8785.
 *
 * Accepts the parsed JSON value (not a string) — canonicalization is on the
 * *value*, not the byte sequence.
 *
 * @example
 * canonicalize({ b: 1, a: 2 })           // => '{"a":2,"b":1}'
 * canonicalize([null, true, "x"])         // => '[null,true,"x"]'
 */
export const canonicalize = (value: unknown): string => {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return canonicalNumber(value);
  if (typeof value === "string") return canonicalString(value);
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .sort(sortKeysLex);
    return `{${keys
      .map((k) => `${canonicalString(k)}:${canonicalize(obj[k])}`)
      .join(",")}}`;
  }
  throw new Error(`JCS: unsupported type ${typeof value}`);
};
