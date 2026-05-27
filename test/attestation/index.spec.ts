import { describe, expect, it } from "vitest";

import {
  canonicalize,
  computeDescriptorHash,
  ERC7730_EAS_SCHEMA_UID,
} from "../../src/index.js";

describe("public attestation exports", () => {
  it("re-exports canonicalize from the package entry point", () => {
    expect(typeof canonicalize).toBe("function");
    expect(canonicalize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it("re-exports computeDescriptorHash from the package entry point", () => {
    expect(typeof computeDescriptorHash).toBe("function");
    expect(computeDescriptorHash({ a: 1 })).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("exposes the canonical ERC-7730 EAS schema UID as a 32-byte hex string", () => {
    expect(ERC7730_EAS_SCHEMA_UID).toBe(
      "0xe023eef113c1670774801c34b377fdf612dd8a4d2fa92fe382e15bd91fafb5c2",
    );
    expect(ERC7730_EAS_SCHEMA_UID).toMatch(/^0x[0-9a-f]{64}$/);
  });
});
