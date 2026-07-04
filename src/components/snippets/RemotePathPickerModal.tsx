import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { Modal, ModalCard } from "@/components/shared/Modal";
import { useConnectionStore } from "@/stores/connectionStore";
import { useSftpDir, breadcrumbs } from "@/services/useSftpDir";
import { formInputClass, formInputStyle } from "@/components/shared/Panel";
import type { Connection } from "@/types";

interface Props {
  isDir: boolean;
  onPick: (path: string) => void;
  onClose: () => void;
}

export function RemotePathPickerModal({ isDir, onPick, onClose }: Props) {
  const { t } = useTranslation();
  const connections = useConnectionStore((s) => s.connections);
  const teamConnections = useConnectionStore((s) => s.teamConnections);
  const all = [...connections, ...Object.values(teamConnections).flat()];
  const [conn, setConn] = useState<Connection | undefined>(undefined);

  return (
    <Modal onClose={onClose}>
      <ModalCard solid className="w-[560px] max-w-[92vw] p-4 flex flex-col gap-3">
        <div className="text-sm font-medium">{t("snippets.step.remotePicker.title")}</div>
        <select
          value={conn?.id ?? ""}
          onChange={(e) => setConn(all.find((c) => c.id === e.target.value))}
          className={formInputClass}
          style={formInputStyle}
        >
          <option value="">{t("snippets.step.remotePicker.pickHost")}</option>
          {all.map((c) => (
            <option key={c.id} value={c.id}>{c.name ?? c.host}</option>
          ))}
        </select>
        {conn && <RemoteTree key={conn.id} connection={conn} isDir={isDir} onPick={(p) => { onPick(p); onClose(); }} />}
      </ModalCard>
    </Modal>
  );
}

function RemoteTree({ connection, isDir, onPick }: { connection: Connection; isDir: boolean; onPick: (p: string) => void }) {
  const { t } = useTranslation();
  const { phase, cwd, entries, listing, navigate } = useSftpDir(connection);

  if (phase.tag === "connecting") return <div className="text-xs" style={{ color: "var(--t-text-dim)" }}>{t("snippets.step.remotePicker.connecting")}</div>;
  if (phase.tag === "error") return <div className="text-xs" style={{ color: "var(--t-danger)" }}>{phase.message}</div>;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 text-xs">
        {breadcrumbs(cwd).map((b) => (
          <button key={b.path} type="button" onClick={() => navigate(b.path)} className="underline-offset-2 hover:underline">
            {b.name}
          </button>
        ))}
      </div>
      <div className="h-64 overflow-auto rounded-md border" style={{ borderColor: "var(--t-border)" }}>
        {listing && <div className="p-2 text-xs" style={{ color: "var(--t-text-dim)" }}>…</div>}
        {entries.map((f) => (
          <div key={f.path} className="flex items-center gap-2 px-2 py-1 hover:bg-(--t-bg-hover)">
            <Icon icon={f.isDir ? "lucide:folder" : "lucide:file"} width={14} />
            {f.isDir ? (
              <button type="button" className="text-xs flex-1 text-left" onClick={() => navigate(f.path)}>{f.name}</button>
            ) : (
              <span className="text-xs flex-1">{f.name}</span>
            )}
            <button
              type="button"
              className="text-xs px-2 rounded-md border shrink-0"
              style={{ borderColor: "var(--t-border)" }}
              onClick={() => onPick(f.path)}
              disabled={isDir !== f.isDir}
            >
              {t("snippets.step.remotePicker.select")}
            </button>
          </div>
        ))}
      </div>
      {isDir && (
        <button
          type="button"
          className="text-xs px-2 py-1 rounded-md border self-start"
          style={{ borderColor: "var(--t-border)" }}
          onClick={() => onPick(cwd)}
        >
          {t("snippets.step.remotePicker.selectFolder")}
        </button>
      )}
    </div>
  );
}
