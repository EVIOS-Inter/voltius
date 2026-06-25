import { describe, it, expect } from "vitest";
import { isSaveShortcut, shouldHandleSaveKey } from "./editorSaveKey";

describe("isSaveShortcut", () => {
  it("matches Ctrl+S and Cmd+S regardless of case", () => {
    expect(isSaveShortcut({ ctrlKey: true, metaKey: false, key: "s" })).toBe(true);
    expect(isSaveShortcut({ ctrlKey: false, metaKey: true, key: "S" })).toBe(true);
  });
  it("does not match without a modifier or for other keys", () => {
    expect(isSaveShortcut({ ctrlKey: false, metaKey: false, key: "s" })).toBe(false);
    expect(isSaveShortcut({ ctrlKey: true, metaKey: false, key: "a" })).toBe(false);
  });
});

describe("shouldHandleSaveKey", () => {
  const save = { ctrlKey: true, metaKey: false, key: "s" };

  it("handles the save key only for the active tab", () => {
    expect(shouldHandleSaveKey(save, true)).toBe(true);
  });
  it("ignores the save key when the tab is not active", () => {
    expect(shouldHandleSaveKey(save, false)).toBe(false);
  });
  it("ignores non-save keys even when active", () => {
    expect(shouldHandleSaveKey({ ctrlKey: true, metaKey: false, key: "p" }, true)).toBe(false);
  });
});
