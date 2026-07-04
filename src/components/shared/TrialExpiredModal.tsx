import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ModalCard } from "@/components/shared/Modal";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { openPortal } from "@/utils/billing";

const STORAGE_KEY = "voltius_trial_expired_shown";

export function TrialExpiredModal() {
  const { t } = useTranslation();
  const { tier, trialEndsAt, trialUsed } = useSubscriptionStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trialUsed || !trialEndsAt) return;
    if (tier !== "free") return;
    if (trialEndsAt > new Date()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(true);
  }, [tier, trialEndsAt, trialUsed]);

  if (!visible) return null;

  function handleUpgrade() {
    openPortal();
    setVisible(false);
  }

  return (
    <Modal onClose={() => setVisible(false)}>
      <ModalCard className="flex flex-col gap-4 animate-fadeIn p-8" style={{ width: "min(28rem, 92vw)" }}>
        <div>
          <p className="text-base font-semibold text-(--t-text-primary) mb-1">
            {t("shared.trialExpiredModal.title")}
          </p>
          <p className="text-sm text-(--t-text-muted) leading-relaxed">
            {t("shared.trialExpiredModal.body")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpgrade}
            className="btn btn-primary w-full py-2.5 rounded-lg text-sm font-semibold"
          >
            {t("shared.trialExpiredModal.upgradeButton")}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="btn btn-ghost w-full py-2.5 rounded-lg text-sm"
          >
            {t("shared.trialExpiredModal.laterButton")}
          </button>
        </div>
      </ModalCard>
    </Modal>
  );
}
