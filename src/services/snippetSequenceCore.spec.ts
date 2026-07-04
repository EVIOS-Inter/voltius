import { describe, it, expect } from "vitest";
import { leafTemplateText, resolveLeafSteps, collectSequenceVars } from "./snippetSequenceCore";
import type { LeafStep } from "./snippetFlatten";
import type { DynamicContext } from "./snippetParser";

const ctx: DynamicContext = { connectionHost: "h1", connectionUsername: "u", connectionName: "web-1" };

describe("snippetSequenceCore", () => {
  it("collects a user var shared across a script and a path", () => {
    const steps: LeafStep[] = [
      { kind: "transfer", direction: "upload", local_path: "/tmp/{{name}}", remote_path: "/srv/{{name}}", is_dir: false },
      { kind: "script", content: "chmod +x /srv/{{name}}" },
    ];
    const r = collectSequenceVars(steps, ctx);
    expect(r.userVars.map((v) => v.name)).toEqual(["name"]);
    expect(r.missing.map((v) => v.name)).toEqual(["name"]);
  });

  it("resolves dynamic {{connection.host}} in paths", () => {
    const steps: LeafStep[] = [
      { kind: "transfer", direction: "download", local_path: "/local/{{connection.host}}.log", remote_path: "/var/log/app.log", is_dir: false },
    ];
    const r = collectSequenceVars(steps, ctx);
    const resolved = resolveLeafSteps(steps, r.dynValues);
    expect(resolved[0].kind === "transfer" && resolved[0].local_path).toBe("/local/h1.log");
  });

  it("leafTemplateText includes script and path text", () => {
    const steps: LeafStep[] = [
      { kind: "script", content: "echo {{a}}" },
      { kind: "transfer", direction: "upload", local_path: "{{b}}", remote_path: "{{c}}", is_dir: false },
    ];
    const text = leafTemplateText(steps);
    expect(text).toContain("{{a}}");
    expect(text).toContain("{{b}}");
    expect(text).toContain("{{c}}");
  });
});
