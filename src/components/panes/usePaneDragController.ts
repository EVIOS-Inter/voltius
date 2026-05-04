import { useEffect } from "react";
import { shouldSuppressDragClick, useDragStore } from "@/stores/dragStore";
import { findLeafBySession, useLayoutStore } from "@/stores/layoutStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useSessionStore } from "@/stores/sessionStore";

export function usePaneDragController() {
  const isPointerDown = useDragStore((s) => s.isPointerDown);

  useEffect(() => {
    if (!isPointerDown) return;

    const onMove = (e: MouseEvent) => {
      useDragStore.getState().updatePointer(e.clientX, e.clientY);
    };

    const onUp = () => {
      const drag = useDragStore.getState();
      const layout = useLayoutStore.getState();
      if (drag.isDragging && drag.dropTarget && drag.sessionId) {
        if (drag.dragType === "tab") {
          const existing = findLeafBySession(layout.root, drag.sessionId);
          if (existing) {
            layout.setActivePane(existing.id);
            useSessionStore.getState().setActive(drag.sessionId);
            useNotificationStore.getState().addToast({
              pluginId: "core",
              pluginName: "Voltius",
              type: "toast",
              message: "That session is already visible in the split workspace.",
              severity: "info",
              duration: 2500,
            });
          } else {
            layout.splitPane(drag.dropTarget.paneId, drag.sessionId, drag.dropTarget.position);
            useSessionStore.getState().setActive(drag.sessionId);
          }
        } else if (drag.dragType === "pane" && drag.sourcePaneId) {
          layout.movePane(drag.sourcePaneId, drag.dropTarget.paneId, drag.dropTarget.position);
          useSessionStore.getState().setActive(drag.sessionId);
        }
      }
      useDragStore.getState().endDrag();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") useDragStore.getState().cancelDrag();
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isPointerDown]);
}

export { shouldSuppressDragClick };
