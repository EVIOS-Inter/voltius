import { describe, it, expect } from "vitest";
import { leafTemplateText, resolveLeafSteps, collectSequenceVars } from "./snippetSequenceCore";
import type { LeafStep } from "./snippetFlatten";
import type { DynamicContext } from "./snippetParser";

const ctx: DynamicContext = { connectionHost: "h1", connectionUsername: "u", connectionName: "web-1" };

describe("snippetSequenceCore", () => {
  it("collects a user var shared across a script and a path", () => {
    const steps: LeafStep[] = [
      { kind: "transfer", from: "local", to: "remote", from_path: "/tmp/{{name}}", to_path: "/srv/{{name}}", is_dir: false, mode: "copy", on_conflict: "overwrite" },
      { kind: "script", content: "chmod +x /srv/{{name}}" },
    ];
    const r = collectSequenceVars(steps, ctx);
    expect(r.userVars.map((v) => v.name)).toEqual(["name"]);
    expect(r.missing.map((v) => v.name)).toEqual(["name"]);
  });

  it("resolves dynamic {{connection.host}} in paths", () => {
    const steps: LeafStep[] = [
      { kind: "transfer", from: "remote", to: "local", from_path: "/var/log/app.log", to_path: "/local/{{connection.host}}.log", is_dir: false, mode: "copy", on_conflict: "overwrite" },
    ];
    const r = collectSequenceVars(steps, ctx);
    const resolved = resolveLeafSteps(steps, r.dynValues);
    expect(resolved[0].kind === "transfer" && resolved[0].to_path).toBe("/local/h1.log");
  });

  it("resolveLeafSteps returns new objects without mutating the input", () => {
    const steps: LeafStep[] = [
      { kind: "script", content: "echo {{name}}" },
      { kind: "transfer", from: "local", to: "remote", from_path: "/tmp/{{name}}", to_path: "/srv/{{name}}", is_dir: false, mode: "copy", on_conflict: "overwrite" },
    ];
    const snapshot = JSON.parse(JSON.stringify(steps));
    steps.forEach((s) => Object.freeze(s));
    Object.freeze(steps);

    const out = resolveLeafSteps(steps, { name: "app" });

    expect(steps).toEqual(snapshot); // input untouched
    expect(out[0]).not.toBe(steps[0]); // new references
    expect(out[1]).not.toBe(steps[1]);
    expect(out[0].kind === "script" && out[0].content).toBe("echo app");
    expect(out[1].kind === "transfer" && out[1].from_path).toBe("/tmp/app");
    expect(out[1].kind === "transfer" && out[1].to_path).toBe("/srv/app");
  });

  it("leafTemplateText includes script and path text", () => {
    const steps: LeafStep[] = [
      { kind: "script", content: "echo {{a}}" },
      { kind: "transfer", from: "local", to: "remote", from_path: "{{b}}", to_path: "{{c}}", is_dir: false, mode: "copy", on_conflict: "overwrite" },
    ];
    const text = leafTemplateText(steps);
    expect(text).toContain("{{a}}");
    expect(text).toContain("{{b}}");
    expect(text).toContain("{{c}}");
  });
});
