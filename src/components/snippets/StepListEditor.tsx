import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { pickLocalPath } from "@/services/sftp";
import { formInputClass, formInputStyle } from "@/components/shared/Panel";
import { VariableTextarea } from "@/components/snippets/VariableTextarea";
import type { SnippetStep, Snippet } from "@/types";

interface Props {
  value: SnippetStep[];
  onChange: (steps: SnippetStep[]) => void;
  snippets: Snippet[];
}

export function StepListEditor({ value, onChange, snippets }: Props) {
  const { t } = useTranslation();
  const update = (i: number, step: SnippetStep) => onChange(value.map((s, j) => (j === i ? step : s)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = (step: SnippetStep) => onChange([...value, step]);

  return (
    <div className="flex flex-col gap-2">
      {value.map((step, i) => (
        <div key={i} className="rounded-lg border p-2 flex flex-col gap-2" style={{ borderColor: "var(--t-border)" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium" style={{ color: "var(--t-text-dim)" }}>
              {t(`snippets.step.kind.${step.kind}`)}
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} aria-label={t("snippets.step.moveUp")}><Icon icon="lucide:chevron-up" width={14} /></button>
              <button type="button" onClick={() => move(i, 1)} aria-label={t("snippets.step.moveDown")}><Icon icon="lucide:chevron-down" width={14} /></button>
              <button type="button" onClick={() => remove(i)} aria-label={t("snippets.step.remove")}><Icon icon="lucide:trash-2" width={14} /></button>
            </div>
          </div>

          {step.kind === "script" && (
            <VariableTextarea
              value={step.content}
              onChange={(v) => update(i, { ...step, content: v })}
              rows={3}
            />
          )}

          {step.kind === "transfer" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => update(i, { ...step, direction: step.direction === "upload" ? "download" : "upload" })}
                  className="text-xs px-2 py-1 rounded-md border"
                  style={{ borderColor: "var(--t-border)" }}
                >
                  {t(`snippets.step.direction.${step.direction}`)}
                </button>
                <button
                  type="button"
                  onClick={() => update(i, { ...step, is_dir: !step.is_dir })}
                  className="text-xs px-2 py-1 rounded-md border"
                  style={{ borderColor: "var(--t-border)" }}
                >
                  {step.is_dir ? t("snippets.step.folder") : t("snippets.step.file")}
                </button>
              </div>
              <div className="flex gap-1">
                <input
                  value={step.local_path}
                  onChange={(e) => update(i, { ...step, local_path: e.target.value })}
                  placeholder={t("snippets.step.localPath")}
                  className={formInputClass}
                  style={formInputStyle}
                />
                <button
                  type="button"
                  onClick={async () => {
                    const p = await pickLocalPath({ directory: step.is_dir });
                    if (p) update(i, { ...step, local_path: p });
                  }}
                  className="text-xs px-2 rounded-md border shrink-0"
                  style={{ borderColor: "var(--t-border)" }}
                >
                  {t("snippets.step.browse")}
                </button>
              </div>
              <input
                value={step.remote_path}
                onChange={(e) => update(i, { ...step, remote_path: e.target.value })}
                placeholder={t("snippets.step.remotePath")}
                className={formInputClass}
                style={formInputStyle}
              />
            </div>
          )}

          {step.kind === "snippet" && (
            <select
              value={step.snippet_id}
              onChange={(e) => update(i, { ...step, snippet_id: e.target.value })}
              className={formInputClass}
              style={formInputStyle}
            >
              <option value="">{t("snippets.step.selectSnippet")}</option>
              {snippets.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <button type="button" onClick={() => add({ kind: "script", content: "" })} className="text-xs px-2 py-1 rounded-md border" style={{ borderColor: "var(--t-border)" }}>{t("snippets.step.addScript")}</button>
        <button type="button" onClick={() => add({ kind: "transfer", direction: "upload", local_path: "", remote_path: "", is_dir: false })} className="text-xs px-2 py-1 rounded-md border" style={{ borderColor: "var(--t-border)" }}>{t("snippets.step.addTransfer")}</button>
        <button type="button" onClick={() => add({ kind: "snippet", snippet_id: "" })} className="text-xs px-2 py-1 rounded-md border" style={{ borderColor: "var(--t-border)" }}>{t("snippets.step.addSnippet")}</button>
      </div>
    </div>
  );
}
