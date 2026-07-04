import i18n from "@/i18n";
import type { Snippet, SnippetStep } from "@/types";

export type LeafStep = Extract<SnippetStep, { kind: "script" | "transfer" }>;

export interface FlattenResult {
  steps: LeafStep[];
  errors: string[];
}

const MAX_DEPTH = 50;
const MAX_STEPS = 1000;

export function flattenSnippetSteps(root: Snippet, byId: Map<string, Snippet>): FlattenResult {
  const steps: LeafStep[] = [];
  const errors: string[] = [];
  let capped = false;

  function walk(snippet: Snippet, stack: string[], depth: number) {
    if (depth > MAX_DEPTH) {
      errors.push(i18n.t("snippets.sequence.flatten.tooDeep", { name: snippet.name }));
      return;
    }
    for (const step of snippet.steps) {
      if (capped) return;
      if (step.kind === "script" || step.kind === "transfer") {
        if (steps.length >= MAX_STEPS) {
          errors.push(i18n.t("snippets.sequence.flatten.tooManySteps"));
          capped = true;
          return;
        }
        steps.push(step);
        continue;
      }
      if (stack.includes(step.snippet_id)) {
        errors.push(i18n.t("snippets.sequence.flatten.cycle", { name: snippet.name }));
        continue;
      }
      const child = byId.get(step.snippet_id);
      if (!child) {
        errors.push(i18n.t("snippets.sequence.flatten.missingRef", { id: step.snippet_id }));
        continue;
      }
      walk(child, [...stack, step.snippet_id], depth + 1);
    }
  }

  walk(root, [root.id], 0);
  return { steps, errors };
}
