/**
 * Error codes are stable identifiers, NOT display text — callers map them to
 * localized strings via t() at render time (see QuickForwardRow.tsx). Do not
 * value-match these against literal English; only the code itself is stable.
 */
export type QuickForwardErrorCode = "emptyInput" | "tooManyParts" | "invalidRemotePort" | "invalidLocalPort";

export type QuickForwardResult =
  | { ok: true; remotePort: number; localPort?: number }
  | { ok: false; error: QuickForwardErrorCode };

function parsePort(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 65535) return null;
  return n;
}

/**
 * Parse a quick-forward input for an ad-hoc local forward.
 *  - "3000"       → { remotePort: 3000 }              (local port auto = remote)
 *  - "3000:8080"  → { remotePort: 3000, localPort: 8080 }  (syntax is remote:local)
 */
export function parseQuickForward(input: string): QuickForwardResult {
  const trimmed = input.trim();
  if (trimmed === "") return { ok: false, error: "emptyInput" };

  const parts = trimmed.split(":");
  if (parts.length > 2) return { ok: false, error: "tooManyParts" };

  const remotePort = parsePort(parts[0]);
  if (remotePort === null) return { ok: false, error: "invalidRemotePort" };

  if (parts.length === 1) return { ok: true, remotePort };

  const localPort = parsePort(parts[1]);
  if (localPort === null) return { ok: false, error: "invalidLocalPort" };

  return { ok: true, remotePort, localPort };
}
