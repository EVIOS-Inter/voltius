import type { TeamVaultStatus } from "@/stores/teamVaultStateStore";

export type TeamObjectListErrorAction = "fallback" | Extract<TeamVaultStatus, "offline" | "forbidden" | "payment_required">;

export function classifyTeamObjectListError(err: unknown): TeamObjectListErrorAction {
  // Prefer machine-readable classification data (set by fetchTeamApi via
  // apiError) over matching translated message text, which is locale-dependent
  // and breaks for any non-English UI language.
  const meta = err as { status?: number; offline?: boolean } | null;
  if (meta?.offline) return "offline";
  if (meta?.status === 403) return "forbidden";
  if (meta?.status === 402) return "payment_required";

  // Legacy fallback for callers/errors that don't set status/offline.
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("403") || message.toLowerCase().includes("permission")) return "forbidden";
  if (message.includes("402") || message.toLowerCase().includes("subscription")) return "payment_required";
  if (message.toLowerCase().includes("network") || message.toLowerCase().includes("connected")) return "offline";
  return "fallback";
}
