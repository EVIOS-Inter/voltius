/** Pure helpers for the `{{`-variable autocomplete shared by the snippet
 *  editors. No React — unit-tested in isolation. */

export interface DynamicVarDefKey {
  value: string;
  descKey: string;
}

export const DYNAMIC_VAR_DEF_KEYS: DynamicVarDefKey[] = [
  { value: "connection.host",     descKey: "snippets.form.dynamicVars.connectionHost" },
  { value: "connection.username", descKey: "snippets.form.dynamicVars.connectionUsername" },
  { value: "connection.name",     descKey: "snippets.form.dynamicVars.connectionName" },
  { value: "date",                descKey: "snippets.form.dynamicVars.date" },
  { value: "datetime",            descKey: "snippets.form.dynamicVars.datetime" },
  { value: "timestamp",           descKey: "snippets.form.dynamicVars.timestamp" },
  { value: "clipboard",           descKey: "snippets.form.dynamicVars.clipboard" },
];

/** The in-progress variable name typed after the nearest unclosed `{{`, or null
 *  if the cursor is not inside an open `{{…` at the given text. */
export function activeVarQuery(textBeforeCursor: string): string | null {
  const match = textBeforeCursor.match(/\{\{([^}]*)$/);
  return match ? match[1] : null;
}

export interface VarInsertion {
  value: string;
  cursor: number;
}

/** Insert `{{varName}}` at the cursor. If an open `{{query` precedes the cursor,
 *  the partial query is replaced; otherwise a fresh `{{varName}}` is inserted
 *  (any selection between selStart/selEnd is overwritten). */
export function insertVarAt(value: string, selStart: number, selEnd: number, varName: string): VarInsertion {
  const before = value.slice(0, selStart);
  const after = value.slice(selEnd);
  const match = before.match(/\{\{([^}]*)$/);
  if (match) {
    const start = selStart - match[1].length;
    return { value: before.slice(0, start) + varName + "}}" + after, cursor: start + varName.length + 2 };
  }
  return { value: before + "{{" + varName + "}}" + after, cursor: selStart + varName.length + 4 };
}

/** Dynamic-var defs whose value prefix-matches the query (case-insensitive). */
export function filterDynamicVars<T extends { value: string }>(defs: T[], query: string): T[] {
  const q = query.toLowerCase();
  return defs.filter((d) => d.value.startsWith(q));
}
