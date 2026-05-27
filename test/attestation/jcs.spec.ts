import { describe, expect, it } from "vitest";

import { canonicalize } from "../../src/attestation/jcs.js";

describe("canonicalize (RFC 8785 JCS)", () => {
  it("sorts object keys lexicographically by code unit", () => {
    expect(canonicalize({ b: 1, a: 2, c: 3 })).toBe('{"a":2,"b":1,"c":3}');
  });

  it("recursively canonicalizes nested objects", () => {
    expect(canonicalize({ outer: { b: 1, a: 2 } })).toBe(
      '{"outer":{"a":2,"b":1}}',
    );
  });

  it("preserves array order", () => {
    expect(canonicalize([3, 1, 2])).toBe("[3,1,2]");
  });

  it("serializes null, true, false verbatim", () => {
    expect(canonicalize(null)).toBe("null");
    expect(canonicalize(true)).toBe("true");
    expect(canonicalize(false)).toBe("false");
  });

  it("normalizes negative zero to '0' per RFC 8785 §3.2.2.2", () => {
    expect(canonicalize(-0)).toBe("0");
    expect(canonicalize(0)).toBe("0");
  });

  it("rejects non-finite numbers", () => {
    expect(() => canonicalize(NaN)).toThrow(/non-finite/);
    expect(() => canonicalize(Infinity)).toThrow(/non-finite/);
    expect(() => canonicalize(-Infinity)).toThrow(/non-finite/);
  });

  it("rejects unsupported value types (function, undefined, symbol)", () => {
    expect(() => canonicalize(undefined)).toThrow(/unsupported type/);
    expect(() => canonicalize(() => 1)).toThrow(/unsupported type/);
    expect(() => canonicalize(Symbol("x"))).toThrow(/unsupported type/);
  });

  it("escapes control characters, quote, and backslash in strings", () => {
    expect(canonicalize("a\nb")).toBe('"a\\nb"');
    expect(canonicalize('he said "hi"')).toBe('"he said \\"hi\\""');
    expect(canonicalize("path\\to\\file")).toBe('"path\\\\to\\\\file"');
    // Non-printable U+0001 → .
    expect(canonicalize("\x01")).toBe('"\\u0001"');
  });

  it("drops object entries whose value is undefined (matches JSON.stringify)", () => {
    expect(canonicalize({ a: 1, b: undefined, c: 2 })).toBe('{"a":1,"c":2}');
  });

  it("produces stable output regardless of input key insertion order", () => {
    const a = canonicalize({ x: 1, y: 2, z: 3 });
    const b = canonicalize({ z: 3, y: 2, x: 1 });
    const c = canonicalize({ y: 2, x: 1, z: 3 });
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("matches cyberphone test vector for arrays of objects", () => {
    // From the canonical RFC 8785 test corpus — keys sorted, no whitespace.
    const input = [
      { b: 1, a: 2 },
      { d: 3, c: 4 },
    ];
    expect(canonicalize(input)).toBe('[{"a":2,"b":1},{"c":4,"d":3}]');
  });
});
