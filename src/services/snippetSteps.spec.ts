import { describe, it, expect } from "vitest";
import { snippetScriptText, snippetSearchText, stepsFromLegacy, normalizeSnippetSteps } from "./snippetSteps";
import type { Snippet } from "@/types";

function mk(steps: Snippet["steps"]): Snippet {
  return { id: "1", name: "n", steps, tags: [], favorite: false, only_for_connection_tags: [], only_for_distros: [], created_at: "", updated_at: "", vault_id: "personal", clocks: {} };
}

describe("snippetSteps", () => {
  it("stepsFromLegacy wraps content", () => {
    expect(stepsFromLegacy("echo hi")).toEqual([{ kind: "script", content: "echo hi" }]);
  });

  it("normalizeSnippetSteps derives steps from legacy content", () => {
    const out = normalizeSnippetSteps({ content: "x" });
    expect(out.steps).toEqual([{ kind: "script", content: "x" }]);
  });

  it("migrates a legacy upload transfer to from/to shape", () => {
    const out = normalizeSnippetSteps({
      steps: [{ kind: "transfer", direction: "upload", local_path: "/l", remote_path: "/r", is_dir: false }] as any,
    });
    expect(out.steps[0]).toEqual({
      kind: "transfer", from: "local", to: "remote", from_path: "/l", to_path: "/r",
      is_dir: false, mode: "copy", on_conflict: "overwrite",
    });
  });

  it("migrates a legacy download transfer (remote is the source)", () => {
    const out = normalizeSnippetSteps({
      steps: [{ kind: "transfer", direction: "download", local_path: "/l", remote_path: "/r", is_dir: true }] as any,
    });
    expect(out.steps[0]).toEqual({
      kind: "transfer", from: "remote", to: "local", from_path: "/r", to_path: "/l",
      is_dir: true, mode: "copy", on_conflict: "overwrite",
    });
  });

  it("leaves an already-migrated transfer untouched (idempotent)", () => {
    const step = {
      kind: "transfer", from: "remote", to: "remote", from_path: "/a", to_path: "/b",
      is_dir: false, mode: "move", on_conflict: "skip",
    } as const;
    const out = normalizeSnippetSteps({ steps: [{ ...step }] });
    expect(out.steps[0]).toEqual(step);
  });

  it("snippetScriptText joins script steps only", () => {
    const s = mk([
      { kind: "script", content: "a" },
      { kind: "transfer", from: "local", to: "remote", from_path: "/l", to_path: "/r", is_dir: false, mode: "copy", on_conflict: "overwrite" },
      { kind: "script", content: "b" },
    ]);
    expect(snippetScriptText(s)).toBe("a\nb");
  });

  it("snippetSearchText includes transfer paths", () => {
    const s = mk([{ kind: "transfer", from: "remote", to: "local", from_path: "/var/log/app", to_path: "/logs", is_dir: true, mode: "copy", on_conflict: "overwrite" }]);
    expect(snippetSearchText(s)).toContain("/var/log/app");
    expect(snippetSearchText(s)).toContain("/logs");
  });
});
