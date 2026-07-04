import { useMemo, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { formInputClass, formInputStyle } from "@/components/shared/Panel";
import { activeVarQuery, insertVarAt, filterDynamicVars, DYNAMIC_VAR_DEF_KEYS } from "./varAutocomplete";

interface Props {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}

/** A monospace textarea with the shared `{{`-variable autocomplete dropdown.
 *  Used by SnippetForm's single-script fast path and StepListEditor's script
 *  rows so both offer the same dynamic-var suggestions. */
export function VariableTextarea({ value, onChange, rows = 3, placeholder, className = "", style }: Props) {
  const { t } = useTranslation();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  const defs = useMemo(
    () => DYNAMIC_VAR_DEF_KEYS.map((d) => ({ value: d.value, desc: t(d.descKey) })),
    [t],
  );
  const suggestions = query !== null ? filterDynamicVars(defs, query) : [];

  function syncQuery(el: HTMLTextAreaElement) {
    const q = activeVarQuery(el.value.slice(0, el.selectionStart));
    setQuery(q);
    if (q !== null) setIdx(0);
  }

  function insert(varName: string) {
    const el = ref.current;
    if (!el) return;
    const { value: next, cursor } = insertVarAt(el.value, el.selectionStart, el.selectionEnd, varName);
    onChange(next);
    setQuery(null);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(cursor, cursor); });
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => { onChange(e.target.value); syncQuery(e.target); }}
        onSelect={(e) => syncQuery(e.currentTarget)}
        onKeyDown={(e) => {
          if (suggestions.length === 0) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
          else if ((e.key === "Enter" || e.key === "Tab") && query !== null) { e.preventDefault(); insert(suggestions[idx]?.value ?? ""); }
          else if (e.key === "Escape") { setQuery(null); }
        }}
        onBlur={() => setTimeout(() => setQuery(null), 100)}
        placeholder={placeholder}
        rows={rows}
        className={`${formInputClass} font-mono resize-y ${className}`}
        style={{ ...formInputStyle, ...style }}
      />

      {suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 z-50 w-full mt-1 rounded-lg shadow-lg overflow-hidden"
          style={{ background: "var(--t-bg-card)", border: "1px solid var(--t-border)" }}
        >
          {suggestions.map((s, i) => (
            <button
              key={s.value}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); insert(s.value); }}
              className={`flex items-center justify-between w-full px-3 py-1.5 text-xs text-left transition-colors ${
                i === idx ? "bg-(--t-bg-elevated)" : "hover:bg-(--t-bg-elevated)"
              }`}
            >
              <code className="font-mono" style={{ color: "var(--t-accent)" }}>{`{{${s.value}}}`}</code>
              <span style={{ color: "var(--t-text-dim)" }}>{s.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
