import { describe, it, expect } from "vitest";
import { parseQuickForward } from "./parseQuickForward";

describe("parseQuickForward", () => {
  it("bare port → remotePort only, no localPort", () => {
    expect(parseQuickForward("3000")).toEqual({ ok: true, remotePort: 3000 });
  });

  it("remote:local → both ports", () => {
    expect(parseQuickForward("3000:8080")).toEqual({
      ok: true,
      remotePort: 3000,
      localPort: 8080,
    });
  });

  it("trims surrounding whitespace", () => {
    expect(parseQuickForward("  3000  ")).toEqual({ ok: true, remotePort: 3000 });
  });

  it("empty input → error", () => {
    expect(parseQuickForward("")).toEqual({ ok: false, error: "emptyInput" });
  });

  it("whitespace-only → error", () => {
    expect(parseQuickForward("   ")).toEqual({ ok: false, error: "emptyInput" });
  });

  it("non-numeric → error", () => {
    expect(parseQuickForward("abc")).toEqual({ ok: false, error: "invalidRemotePort" });
  });

  it("zero is out of range → error", () => {
    expect(parseQuickForward("0")).toEqual({ ok: false, error: "invalidRemotePort" });
  });

  it("above 65535 → error", () => {
    expect(parseQuickForward("70000")).toEqual({ ok: false, error: "invalidRemotePort" });
  });

  it("invalid local port → error", () => {
    expect(parseQuickForward("3000:0")).toEqual({
      ok: false,
      error: "invalidLocalPort",
    });
  });

  it("trailing colon (empty local) → error", () => {
    expect(parseQuickForward("3000:")).toEqual({
      ok: false,
      error: "invalidLocalPort",
    });
  });

  it("too many segments → error", () => {
    expect(parseQuickForward("1:2:3")).toEqual({
      ok: false,
      error: "tooManyParts",
    });
  });
});
