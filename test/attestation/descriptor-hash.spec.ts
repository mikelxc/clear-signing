import { describe, expect, it } from "vitest";

import { computeDescriptorHash } from "../../src/attestation/descriptor-hash.js";

describe("computeDescriptorHash (ERC-8176)", () => {
  it("produces a 0x-prefixed 32-byte hex string", () => {
    const hash = computeDescriptorHash({
      context: { contract: { deployments: [] } },
    });
    expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("is stable across object key insertion order", () => {
    const a = computeDescriptorHash({ a: 1, b: 2 });
    const b = computeDescriptorHash({ b: 2, a: 1 });
    expect(a).toBe(b);
  });

  it("changes when descriptor content changes", () => {
    const h1 = computeDescriptorHash({ a: 1 });
    const h2 = computeDescriptorHash({ a: 2 });
    expect(h1).not.toBe(h2);
  });

  it("is whitespace-insensitive (canonical form is on the value, not the bytes)", () => {
    // Both inputs parse to the same JSON value; both should hash identically.
    const fromCompact = computeDescriptorHash(JSON.parse('{"a":1,"b":2}'));
    const fromPretty = computeDescriptorHash(
      JSON.parse('{\n  "a": 1,\n  "b": 2\n}'),
    );
    expect(fromCompact).toBe(fromPretty);
  });

  it("matches the known keccak256 of the canonical form for a tiny descriptor", () => {
    // canonicalize({a:1}) === '{"a":1}' (7 bytes).
    // Pinning the value catches accidental changes to canonicalize() or the
    // hashing pipeline. Recompute with an independent JCS implementation +
    // keccak256 to update.
    const hash = computeDescriptorHash({ a: 1 });
    expect(hash).toBe(
      "0x25e7c2a96531eb50246780c1f25742e489bf55210e26981dc02992bb585feb97",
    );
  });
});
