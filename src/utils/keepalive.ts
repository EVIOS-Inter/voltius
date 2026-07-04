export type KeepalivePreset = "fast" | "balanced" | "tolerant" | "off";

export const DEFAULT_KEEPALIVE_PRESET: KeepalivePreset = "balanced";

// intervalSecs 0 disables keepalive. Detection time ≈ intervalSecs × max.
// labelKey/detailKey are i18n keys resolved via t() at render time (see
// HostsSection.tsx / ConnectionForm.tsx) — never cache the translated string here.
export const KEEPALIVE_PRESETS: Record<
  KeepalivePreset,
  { intervalSecs: number; max: number; labelKey: string; detailKey: string }
> = {
  fast: { intervalSecs: 2, max: 2, labelKey: "settings.hosts.keepalivePresets.fast.label", detailKey: "settings.hosts.keepalivePresets.fast.detail" },
  balanced: { intervalSecs: 3, max: 3, labelKey: "settings.hosts.keepalivePresets.balanced.label", detailKey: "settings.hosts.keepalivePresets.balanced.detail" },
  tolerant: { intervalSecs: 5, max: 4, labelKey: "settings.hosts.keepalivePresets.tolerant.label", detailKey: "settings.hosts.keepalivePresets.tolerant.detail" },
  off: { intervalSecs: 0, max: 0, labelKey: "settings.hosts.keepalivePresets.off.label", detailKey: "settings.hosts.keepalivePresets.off.detail" },
};

export function resolveKeepalive(preset: KeepalivePreset): { intervalSecs: number; max: number } {
  const { intervalSecs, max } = KEEPALIVE_PRESETS[preset] ?? KEEPALIVE_PRESETS[DEFAULT_KEEPALIVE_PRESET];
  return { intervalSecs, max };
}
