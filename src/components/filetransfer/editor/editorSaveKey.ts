export interface SaveKeyEvent {
  ctrlKey: boolean;
  metaKey: boolean;
  key: string;
}

export function isSaveShortcut(e: SaveKeyEvent): boolean {
  return (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s";
}

export function shouldHandleSaveKey(e: SaveKeyEvent, isActive: boolean): boolean {
  return isActive && isSaveShortcut(e);
}
