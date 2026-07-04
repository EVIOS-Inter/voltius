import { Icon } from "@iconify/react";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "@/components/shared/InfoTooltip";

const BLOG_URL = "https://voltius.app/blog/sftp-tar-acceleration";

/** Zap badge shown on tar-accelerated transfers, with a hover card explaining it. */
export function AcceleratedBadge() {
  const { t } = useTranslation();
  return (
    <InfoTooltip icon="lucide:zap" iconColor="var(--t-accent)" width={11} placement="top" interactive>
      <div className="flex items-center gap-1.5 mb-1 font-medium text-(--t-text-primary)">
        <Icon icon="lucide:zap" width={12} style={{ color: "var(--t-accent)" }} />
        {t("fileTransfer.acceleratedBadge.title")}
      </div>
      <p className="m-0">{t("fileTransfer.acceleratedBadge.description")}</p>
      <button
        type="button"
        onClick={() => void openUrl(BLOG_URL)}
        className="mt-1.5 inline-flex items-center gap-1 text-(--t-accent) hover:underline"
      >
        {t("fileTransfer.acceleratedBadge.howItWorks")}
        <Icon icon="lucide:arrow-up-right" width={12} />
      </button>
    </InfoTooltip>
  );
}
