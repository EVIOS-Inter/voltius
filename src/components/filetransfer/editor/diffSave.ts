import type { DiffDoc, DiffSide } from "@/stores/editorStore";

export type DiffPane = "a" | "b";

export function sideMeta(doc: DiffDoc, side: DiffPane): DiffSide {
  return side === "a" ? doc.left : doc.right;
}

export function dirtySides(dirty: { a: boolean; b: boolean }): DiffPane[] {
  const out: DiffPane[] = [];
  if (dirty.a) out.push("a");
  if (dirty.b) out.push("b");
  return out;
}
