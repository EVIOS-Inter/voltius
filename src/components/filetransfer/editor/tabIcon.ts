import type { EditorTab } from "@/stores/editorStore";

const CODE = new Set([
  "ts","tsx","js","jsx","mjs","cjs","go","rs","py","c","h","cpp","cc","cxx",
  "hpp","java","kt","kts","cs","rb","lua","pl","pm","swift","sh","bash","zsh",
  "ksh","ps1","psm1",
]);
const DATA = new Set(["json","toml","yaml","yml","ini","cfg","conf","properties","env","xml"]);
const DOC = new Set(["md","markdown","txt"]);

export function tabIcon(tab: EditorTab): string {
  if (tab.kind === "diff") return "lucide:git-compare";
  const base = tab.path.split("/").pop() ?? tab.path;
  const dot = base.lastIndexOf(".");
  const ext = dot > 0 ? base.slice(dot + 1).toLowerCase() : "";
  if (CODE.has(ext)) return "lucide:file-code";
  if (DATA.has(ext)) return "lucide:file-cog";
  if (DOC.has(ext)) return "lucide:file-text";
  return "lucide:file";
}
