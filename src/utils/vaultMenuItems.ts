import type { TFunction } from "i18next";
import type { VaultOption } from "@/types";
import type { ContextMenuItem } from "@/components/shared/ContextMenu";

/**
 * Returns the standard "Move to" / "Copy to" vault submenu items.
 * Centralised here so every entity type (keys, identities, connections,
 * snippets, …) gets identical behaviour without copy-paste.
 *
 * @param vaults   Other vaults the item can be moved/copied to (current vault excluded)
 * @param canEdit  Whether the user can edit the item (gates "Move to")
 * @param onMoveTo Called with the target vaultId; omit to hide "Move to"
 * @param onCopyTo Called with the target vaultId; omit to hide "Copy to"
 * @param t        Translation function, called at render time (no caching)
 */
export function vaultMenuItems(
  vaults: VaultOption[] | undefined,
  canEdit: boolean | undefined,
  onMoveTo: ((vaultId: string) => void) | undefined,
  onCopyTo: ((vaultId: string) => void) | undefined,
  t: TFunction,
): ContextMenuItem[] {
  if (!vaults || vaults.length === 0) return [];

  const items: ContextMenuItem[] = [];

  if (canEdit && onMoveTo) {
    items.push({
      label: t("common.action.moveTo"),
      icon: "lucide:vault",
      divider: true,
      children: vaults.map((v) => ({
        label: v.name,
        icon: "lucide:vault",
        onClick: () => onMoveTo(v.id),
      })),
    });
  }

  if (canEdit && onCopyTo) {
    items.push({
      label: t("common.action.copyTo"),
      icon: "lucide:copy-plus",
      divider: !items.length,
      children: vaults.map((v) => ({
        label: v.name,
        icon: "lucide:copy-plus",
        onClick: () => onCopyTo(v.id),
      })),
    });
  }

  return items;
}
