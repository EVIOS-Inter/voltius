// Pointer-event tab drag (modeled on internalDrag.ts). Two external-store
// slices: high-frequency cursor `move` and low-frequency `semantic` (drop target).
import { useSyncExternalStore } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { dropIntent } from "./tabDragCore";

export type TabDropTarget =
  | { kind: "diff"; targetId: string }
  | { kind: "reorder"; index: number }
  | null;

export type TabDragSemantic = {
  draggingId: string;
  label: string;
  target: TabDropTarget;
} | null;

export type TabMoveState = { x: number; y: number };

let semantic: TabDragSemantic = null;
let move: TabMoveState = { x: 0, y: 0 };
const semListeners = new Set<() => void>();
const moveListeners = new Set<() => void>();

function targetEq(a: TabDropTarget, b: TabDropTarget): boolean {
  if (a === b) return true;
  if (!a || !b || a.kind !== b.kind) return false;
  if (a.kind === "diff" && b.kind === "diff") return a.targetId === b.targetId;
  if (a.kind === "reorder" && b.kind === "reorder") return a.index === b.index;
  return false;
}

function setSemantic(next: TabDragSemantic) {
  const same =
    semantic === next ||
    (!!semantic && !!next &&
      semantic.draggingId === next.draggingId &&
      targetEq(semantic.target, next.target));
  if (same) return;
  semantic = next;
  semListeners.forEach((f) => f());
}
function setMove(x: number, y: number) {
  move = { x, y };
  moveListeners.forEach((f) => f());
}

const getSemantic = () => semantic;
const getMove = () => move;

export function useTabDragSemantic(): TabDragSemantic {
  return useSyncExternalStore(
    (f) => { semListeners.add(f); return () => semListeners.delete(f); },
    getSemantic, getSemantic,
  );
}
export function useTabMove(): TabMoveState {
  return useSyncExternalStore(
    (f) => { moveListeners.add(f); return () => moveListeners.delete(f); },
    getMove, getMove,
  );
}

const THRESHOLD = 5;

function computeTarget(x: number, y: number, draggingId: string, canDiff: boolean): TabDropTarget {
  const el = document.elementFromPoint(x, y) as HTMLElement | null;
  const tabEl = el?.closest<HTMLElement>("[data-tab-id]");
  if (!tabEl) return null;
  const targetId = tabEl.dataset.tabId;
  if (!targetId) return null;
  const tabs = useEditorStore.getState().tabs;
  const idx = tabs.findIndex((t) => t.id === targetId);
  if (idx < 0) return null;
  const target = tabs[idx];
  const allowDiff = canDiff && target.kind === "file" && targetId !== draggingId;
  const r = tabEl.getBoundingClientRect();
  const zone = dropIntent(x - r.left, r.width, allowDiff);
  if (zone === "diff") return { kind: "diff", targetId };
  return { kind: "reorder", index: zone === "before" ? idx : idx + 1 };
}

export function startTabDragGesture(opts: {
  id: string; label: string; canDiff: boolean; startX: number; startY: number;
}): void {
  let armed = true, active = false, moved = false;

  const onMove = (ev: PointerEvent) => {
    if (armed) {
      const dx = ev.clientX - opts.startX, dy = ev.clientY - opts.startY;
      if (dx * dx + dy * dy < THRESHOLD * THRESHOLD) return;
      armed = false; active = true; moved = true;
    }
    if (!active) return;
    setMove(ev.clientX, ev.clientY);
    setSemantic({
      draggingId: opts.id, label: opts.label,
      target: computeTarget(ev.clientX, ev.clientY, opts.id, opts.canDiff),
    });
  };

  const finish = (ev: PointerEvent) => {
    cleanup();
    if (!active) return;
    const target = computeTarget(ev.clientX, ev.clientY, opts.id, opts.canDiff);
    setSemantic(null);
    if (!target) return;
    const store = useEditorStore.getState();
    if (target.kind === "diff") {
      const dragged = store.tabs.find((t) => t.id === opts.id);
      const tgt = store.tabs.find((t) => t.id === target.targetId);
      if (dragged?.kind === "file" && tgt?.kind === "file") {
        store.openDiff(
          { sftpId: dragged.sftpId, path: dragged.path, hostLabel: dragged.hostLabel },
          { sftpId: tgt.sftpId, path: tgt.path, hostLabel: tgt.hostLabel },
        );
      }
    } else {
      store.moveTab(opts.id, target.index);
    }
  };

  const onKey = (ev: KeyboardEvent) => {
    if (ev.key !== "Escape") return;
    cleanup();
    if (active) setSemantic(null);
  };
  const onClickCapture = (ev: MouseEvent) => {
    if (!moved) return;
    ev.stopPropagation(); ev.preventDefault();
    window.removeEventListener("click", onClickCapture, true);
  };
  function cleanup() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", finish);
    window.removeEventListener("pointercancel", finish);
    window.removeEventListener("keydown", onKey);
    setTimeout(() => window.removeEventListener("click", onClickCapture, true), 0);
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", finish);
  window.addEventListener("pointercancel", finish);
  window.addEventListener("keydown", onKey);
  window.addEventListener("click", onClickCapture, true);
}
