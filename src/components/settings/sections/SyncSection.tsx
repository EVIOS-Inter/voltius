import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { Toggle } from "@/components/shared/Toggle";
import { getSyncState, onSyncStateChange, syncNow } from "@/services/sync";
import { useSyncPrefsStore, SYNC_OBJECT_TYPES } from "@/stores/syncPrefsStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useUIStore } from "@/stores/uiStore";
import { openPortal } from "@/utils/billing";

export default function SyncSection() {
  const { t } = useTranslation();
  const [syncState, setSyncState] = useState(getSyncState);
  useEffect(() => onSyncStateChange(() => setSyncState(getSyncState())), []);

  const accountMode = useSubscriptionStore((s) => s.accountMode);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const openSettings = useUIStore((s) => s.openSettings);
  const openCloudAuth = useUIStore((s) => s.openCloudAuth);
  const { syncTypes, setSyncType } = useSyncPrefsStore();

  const isLoggedIn = accountMode === "server";

  return (
    <div className="p-6 max-w-lg space-y-6">
      {/* Voltius cloud sync */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-(--t-text-dim)">
          {t("settings.sync.voltiusCloud")}
        </h3>
        <div className="rounded-lg px-4 py-3 bg-(--t-bg-elevated) border border-(--t-border)">
          {isLoggedIn && isPro ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-(--t-text-primary)">{t("settings.sync.active.title")}</p>
                <p className="text-xs mt-0.5 text-(--t-text-dim)">
                  {syncState.status === "syncing" && t("settings.sync.active.syncing")}
                  {syncState.status === "error" && t("settings.sync.active.error", { error: syncState.error ?? "unknown" })}
                  {syncState.status === "success" && syncState.lastSync && t("settings.sync.active.lastSync", { time: syncState.lastSync.toLocaleTimeString() })}
                  {syncState.status === "offline" && t("settings.sync.active.offline")}
                  {syncState.status === "idle" && t("settings.sync.active.idle")}
                </p>
              </div>
              <button
                onClick={() => { if (syncState.status !== "syncing") syncNow().catch(() => {}); }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors shrink-0 bg-(--t-bg-input)"
                style={{
                  color: syncState.status === "error" ? "var(--t-status-error)" : "var(--t-text-muted)",
                  opacity: syncState.status === "syncing" ? 0.5 : 1,
                }}
                disabled={syncState.status === "syncing"}
              >
                <Icon
                  icon="lucide:refresh-cw"
                  width={18}
                  className={syncState.status === "syncing" ? "animate-spin" : ""}
                />
                {t("settings.sync.active.syncNow")}
              </button>
            </div>
          ) : isLoggedIn && !isPro ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-(--t-text-primary)">{t("settings.sync.requiresPro.title")}</p>
                <p className="text-xs mt-0.5 text-(--t-text-dim)">{t("settings.sync.requiresPro.sub")}</p>
              </div>
              <button
                onClick={() => openPortal()}
                className="text-xs px-2.5 py-1 rounded-md font-medium shrink-0 bg-(--t-accent) text-white hover:opacity-85 transition-opacity"
              >
                {t("settings.sync.requiresPro.upgrade")}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-(--t-text-primary)">{t("settings.sync.notConnected.title")}</p>
                <p className="text-xs mt-0.5 text-(--t-text-dim)">
                  {t("settings.sync.notConnected.sub")}
                </p>
              </div>
              <button
                onClick={() => openCloudAuth("signin")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 bg-(--t-bg-input) text-(--t-text-primary)"
              >
                {t("settings.sync.notConnected.signIn")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gist sync — pointer to plugins */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-(--t-text-dim)">
          {t("settings.sync.gistTitle")}
        </h3>
        <div className="rounded-lg px-4 py-3 bg-(--t-bg-elevated) border border-(--t-border)">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-(--t-text-primary)">{t("settings.sync.gist.title")}</p>
              <p className="text-xs mt-0.5 text-(--t-text-dim)">{t("settings.sync.gist.sub")}</p>
            </div>
            <button
              onClick={() => openSettings("plugins", "plugin-gist-sync:gist-sync-settings")}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium shrink-0 bg-(--t-bg-input) text-(--t-text-primary) transition-opacity hover:opacity-75"
            >
              {t("settings.sync.gist.configure")}
            </button>
          </div>
        </div>
      </div>

      {/* Sync preferences */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-(--t-text-dim)">
          {t("settings.sync.prefsTitle")}
        </h3>
        <div className="rounded-lg divide-y bg-(--t-bg-elevated) border border-(--t-border)">
          {SYNC_OBJECT_TYPES.map(({ id }, i) => {
            const value = syncTypes[id] ?? true;
            return (
              <div
                key={id}
                className="flex items-center justify-between gap-3 px-4 py-3"
                style={i > 0 ? { borderTop: "1px solid var(--t-border)" } : undefined}
              >
                <div>
                  <p className="text-sm font-medium text-(--t-text-primary)">{t(`settings.sync.objectType.${id}.label`)}</p>
                  <p className="text-xs mt-0.5 text-(--t-text-dim)">{t(`settings.sync.objectType.${id}.sub`)}</p>
                </div>
                <Toggle checked={value} onChange={(v) => setSyncType(id, v)} />
              </div>
            );
          })}
        </div>
        <p className="text-xs mt-2 px-1 text-(--t-text-muted)">
          {t("settings.sync.prefsFooter")}
        </p>
      </div>
    </div>
  );
}
