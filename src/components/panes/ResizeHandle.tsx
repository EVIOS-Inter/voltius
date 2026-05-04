import { useRef } from "react";
import { useLayoutStore, type SplitDirection } from "@/stores/layoutStore";

export function ResizeHandle({
  splitNodeId,
  direction,
  containerRef,
}: {
  splitNodeId: string;
  direction: SplitDirection;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const setRatio = useLayoutStore((s) => s.setRatio);
  const draggingRef = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;

    const onMove = (move: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const ratio = direction === "h"
        ? (move.clientX - rect.left) / rect.width
        : (move.clientY - rect.top) / rect.height;
      setRatio(splitNodeId, ratio);
    };

    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      onMouseDown={onMouseDown}
      className={direction === "h" ? "w-1 cursor-col-resize flex items-center justify-center" : "h-1 cursor-row-resize flex items-center justify-center"}
    >
      <div
        className={direction === "h" ? "w-1.5 h-10 rounded-full" : "h-1.5 w-10 rounded-full"}
        style={{ background: "var(--t-accent)" }}
      />
    </div>
  );
}
