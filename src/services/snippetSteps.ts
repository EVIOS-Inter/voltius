import type { Snippet, SnippetStep } from "@/types";

export function stepsFromLegacy(content: string): SnippetStep[] {
  return [{ kind: "script", content }];
}

export function normalizeSnippetSteps<T extends { steps?: SnippetStep[]; content?: string }>(
  raw: T,
): T & { steps: SnippetStep[] } {
  if (raw.steps && raw.steps.length > 0) return raw as T & { steps: SnippetStep[] };
  return { ...raw, steps: stepsFromLegacy(raw.content ?? "") };
}

export function snippetScriptText(snippet: Pick<Snippet, "steps">): string {
  return snippet.steps
    .filter((s): s is Extract<SnippetStep, { kind: "script" }> => s.kind === "script")
    .map((s) => s.content)
    .join("\n");
}

export function snippetSearchText(snippet: Pick<Snippet, "steps">): string {
  return snippet.steps
    .map((s) => {
      if (s.kind === "script") return s.content;
      if (s.kind === "transfer") return `${s.local_path} ${s.remote_path}`;
      return "";
    })
    .join("\n");
}
