export type QuickForwardResult =
  | { ok: true; remotePort: number; localPort?: number }
  | { ok: false; error: string };

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
  if (trimmed === "") return { ok: false, error: "Enter a port" };

  const parts = trimmed.split(":");
  if (parts.length > 2) return { ok: false, error: "Use port or remote:local" };

  const remotePort = parsePort(parts[0]);
  if (remotePort === null) return { ok: false, error: "Port must be 1–65535" };

  if (parts.length === 1) return { ok: true, remotePort };

  const localPort = parsePort(parts[1]);
  if (localPort === null) return { ok: false, error: "Local port must be 1–65535" };

  return { ok: true, remotePort, localPort };
}
