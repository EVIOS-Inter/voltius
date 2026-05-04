import { Icon } from "@iconify/react";
import { ContextMenu, useContextMenu, type ContextMenuItem } from "@/components/shared/ContextMenu";
import { useConnectionStore } from "@/stores/connectionStore";
import { useDragStore } from "@/stores/dragStore";
import { useHostPingStore } from "@/stores/hostPingStore";
import { findLeaf, getPaneSessionIds, useLayoutStore, type SplitPosition } from "@/stores/layoutStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useTeamSessionStore } from "@/stores/teamSessionStore";
import { getDistroColor, getDistroIcon } from "@/utils/icons";
import type { TerminalSession } from "@/types";

function latencyColor(ms: number): string {
  if (ms < 50) return "var(--t-status-connected)";
  if (ms < 150) return "var(--t-status-warning)";
  return "var(--t-status-error)";
}

function statusColor(status: TerminalSession["status"]): string {
  if (status === "connected") return "var(--t-status-connected)";
  if (status === "connecting") return "var(--t-status-connecting)";
  if (status === "error") return "var(--t-status-error)";
  return "var(--t-text-muted)";
}

function sessionBadge(session: TerminalSession): string {
  if (session.type === "ssh") return "SSH";
  if (session.type === "serial") return "SERIAL";
  if (session.type === "multiplayer") return "MPX";
  return "LOCAL";
}

export function PaneHeader({ paneId, session, active }: { paneId: string; session: TerminalSession; active: boolean }) {
  const connection = useConnectionStore((s) => s.connections.find((c) => c.id === session.connectionId));
  const latencyMs = useHostPingStore((s) => s.latencies[session.connectionId]);
  const pingStatus = useHostPingStore((s) => s.statuses[session.connectionId]);
  const closePane = useLayoutStore((s) => s.closePane);
  const splitPane = useLayoutStore((s) => s.splitPane);
  const maximizedPaneId = useLayoutStore((s) => s.maximizedPaneId);
  const setMaximized = useLayoutStore((s) => s.setMaximized);
  const broadcastActive = useLayoutStore((s) => s.broadcastActive);
  const toggleBroadcast = useLayoutStore((s) => s.toggleBroadcast);
  const reconnect = useSessionStore((s) => s.reconnect);
  const sessions = useSessionStore((s) => s.sessions);
  const mpState = useTeamSessionStore((s) => s.connections[session.id]);
  const { pos, open, close } = useContextMenu();

  const isMaximized = maximizedPaneId === paneId;
  const excludedFromBroadcast = broadcastActive && (session.type === "multiplayer" || (!!mpState && mpState.controlHolder !== "" && mpState.controlHolder !== mpState.myUserId));
  const distroIcon = session.type === "ssh" && connection?.distro ? getDistroIcon(connection.distro) : null;
  const icon = distroIcon ?? (session.type === "local" ? "lucide:terminal" : session.type === "serial" ? "lucide:ethernet-port" : "lucide:radio-tower");
  const iconBg = connection?.distro ? getDistroColor(connection.distro) : undefined;
  const subtitle = session.type === "serial" && session.serialConfig
    ? `${session.serialConfig.port} · ${session.serialConfig.baud}`
    : session.type === "ssh" && connection
      ? `${connection.username}@${connection.host}`
      : null;

  const handleClosePane = () => {
    closePane(paneId);
    const layout = useLayoutStore.getState();
    const nextLeaf = findLeaf(layout.root, layout.activePaneId);
    if (nextLeaf) useSessionStore.getState().setActive(nextLeaf.sessionId);
  };

  const handleContextSplit = (position: SplitPosition) => {
    const visibleSessionIds = new Set(getPaneSessionIds(useLayoutStore.getState().root));
    const candidate = sessions.find((s) => !visibleSessionIds.has(s.id));
    if (!candidate) {
      useNotificationStore.getState().addToast({
        pluginId: "core",
        pluginName: "Voltius",
        type: "toast",
        message: "Open another session or drag an existing tab onto a pane to split.",
        severity: "info",
        duration: 3000,
      });
      return;
    }
    splitPane(paneId, candidate.id, position);
    useSessionStore.getState().setActive(candidate.id);
  };

  const menuItems: ContextMenuItem[] = [
    { label: "Reconnect", icon: "lucide:rotate-cw", onClick: () => void reconnect(session.id) },
    {
      label: "Split",
      icon: "lucide:columns-3",
      children: [
        { label: "Split left", icon: "lucide:arrow-left-to-line", onClick: () => handleContextSplit("left") },
        { label: "Split right", icon: "lucide:arrow-right-to-line", onClick: () => handleContextSplit("right") },
        { label: "Split top", icon: "lucide:arrow-up-to-line", onClick: () => handleContextSplit("top") },
        { label: "Split bottom", icon: "lucide:arrow-down-to-line", onClick: () => handleContextSplit("bottom") },
      ],
    },
    { label: "Close pane", icon: "lucide:x", danger: true, onClick: handleClosePane },
  ];

  const beginDrag = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    useDragStore.getState().beginPaneDrag(paneId, session.id, e.clientX, e.clientY);
  };

  return (
    <div
      onContextMenu={open}
      className="h-7 shrink-0 flex items-center gap-2 px-2 text-xs border-b"
      style={{
        background: broadcastActive
          ? "color-mix(in srgb, var(--t-accent) 12%, var(--t-bg-card))"
          : active
            ? "var(--t-bg-card)"
            : "color-mix(in srgb, var(--t-bg-card) 70%, var(--t-bg-terminal))",
        borderColor: "var(--t-border)",
        color: active ? "var(--t-text-primary)" : "var(--t-text-secondary)",
      }}
    >
      <div onMouseDown={beginDrag} className="min-w-0 flex-1 flex items-center gap-2 cursor-grab active:cursor-grabbing">
        <span
          className="size-5 rounded-md flex items-center justify-center shrink-0"
          style={{ background: iconBg ?? "var(--t-bg-elevated)", color: iconBg ? "#fff" : "var(--t-text-secondary)" }}
        >
          <Icon icon={icon} width={13} />
        </span>
        <span className="truncate font-semibold">{session.connectionName}</span>
        {subtitle && <span className="hidden md:inline truncate max-w-[11rem] text-[var(--t-text-dim)]">{subtitle}</span>}
      </div>

      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <span className="px-1.5 py-0.5 rounded border border-[var(--t-border)] bg-[var(--t-bg-elevated)] text-[10px] font-semibold">
          {sessionBadge(session)}
        </span>
        <span className="size-1.5 rounded-full" style={{ background: statusColor(session.status) }} />
        {session.type === "ssh" && pingStatus === "up" && latencyMs !== undefined && (
          <span style={{ color: latencyColor(latencyMs) }}>{latencyMs}ms</span>
        )}
        {excludedFromBroadcast && <span title="Excluded from broadcast"><Icon icon="lucide:lock" width={13} /></span>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          className="size-5 rounded flex items-center justify-center hover:bg-[var(--t-bg-card-hover)]"
          title={broadcastActive ? "Disable broadcast" : "Broadcast input"}
          onClick={() => toggleBroadcast()}
          style={{ color: broadcastActive ? "var(--t-accent)" : "var(--t-text-dim)" }}
        >
          <Icon icon="lucide:radio-tower" width={13} />
        </button>
        <button
          className="size-5 rounded flex items-center justify-center hover:bg-[var(--t-bg-card-hover)]"
          title={isMaximized ? "Restore pane" : "Maximize pane"}
          onClick={() => setMaximized(isMaximized ? null : paneId)}
        >
          <Icon icon={isMaximized ? "lucide:minimize-2" : "lucide:maximize-2"} width={13} />
        </button>
        <button
          className="size-5 rounded flex items-center justify-center hover:bg-[var(--t-bg-card-hover)] text-[var(--t-text-dim)] hover:text-[var(--t-status-error)]"
          title="Close pane"
          onClick={handleClosePane}
        >
          <Icon icon="lucide:x" width={14} />
        </button>
      </div>
      {pos && <ContextMenu items={menuItems} pos={pos} onClose={close} />}
    </div>
  );
}
