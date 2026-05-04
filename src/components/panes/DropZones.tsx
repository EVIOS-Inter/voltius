import { Icon } from "@iconify/react";
import { useDragStore } from "@/stores/dragStore";
import type { SplitPosition } from "@/stores/layoutStore";

const zones: Array<{ position: SplitPosition; className: string; icon: string }> = [
  { position: "top", className: "left-0 right-0 top-0 h-1/4", icon: "lucide:arrow-up" },
  { position: "bottom", className: "left-0 right-0 bottom-0 h-1/4", icon: "lucide:arrow-down" },
  { position: "left", className: "left-0 top-1/4 bottom-1/4 w-1/4", icon: "lucide:arrow-left" },
  { position: "right", className: "right-0 top-1/4 bottom-1/4 w-1/4", icon: "lucide:arrow-right" },
];

export function DropZones({ paneId }: { paneId: string }) {
  const isDragging = useDragStore((s) => s.isDragging);
  const dropTarget = useDragStore((s) => s.dropTarget);
  const setDropTarget = useDragStore((s) => s.setDropTarget);

  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {zones.map((zone) => {
        const active = dropTarget?.paneId === paneId && dropTarget.position === zone.position;
        return (
          <div
            key={zone.position}
            className={`absolute ${zone.className} pointer-events-auto flex items-center justify-center transition-colors`}
            style={{
              background: active
                ? "color-mix(in srgb, var(--t-accent) 50%, transparent)"
                : "color-mix(in srgb, var(--t-accent) 15%, transparent)",
            }}
            onMouseEnter={() => setDropTarget({ paneId, position: zone.position })}
            onMouseLeave={() => {
              if (useDragStore.getState().dropTarget?.paneId === paneId) setDropTarget(null);
            }}
          >
            {active && <Icon icon={zone.icon} width={28} className="text-[var(--t-accent)]" />}
          </div>
        );
      })}
    </div>
  );
}
