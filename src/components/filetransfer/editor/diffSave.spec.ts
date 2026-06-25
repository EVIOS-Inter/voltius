import { describe, it, expect } from "vitest";
import { sideMeta, dirtySides } from "./diffSave";
import type { DiffDoc } from "@/stores/editorStore";

const doc: DiffDoc = {
  id: "d1",
  kind: "diff",
  left: { sftpId: null, path: "/local/a.txt", hostLabel: "Local Machine" },
  right: { sftpId: "s1", path: "/remote/a.txt", hostLabel: "host" },
  dirty: false,
};

describe("sideMeta", () => {
  it("resolves the left meta for pane a", () => {
    expect(sideMeta(doc, "a")).toBe(doc.left);
  });
  it("resolves the right meta for pane b", () => {
    expect(sideMeta(doc, "b")).toBe(doc.right);
  });
});

describe("dirtySides", () => {
  it("returns only the panes flagged dirty", () => {
    expect(dirtySides({ a: false, b: false })).toEqual([]);
    expect(dirtySides({ a: true, b: false })).toEqual(["a"]);
    expect(dirtySides({ a: false, b: true })).toEqual(["b"]);
    expect(dirtySides({ a: true, b: true })).toEqual(["a", "b"]);
  });
});
