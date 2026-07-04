import { describe, it, expect } from "vitest";
import { activeVarQuery, insertVarAt, filterDynamicVars, DYNAMIC_VAR_DEF_KEYS } from "./varAutocomplete";

describe("activeVarQuery", () => {
  it("returns the partial query after an open {{", () => {
    expect(activeVarQuery("echo {{na")).toBe("na");
  });
  it("returns an empty string right after {{", () => {
    expect(activeVarQuery("echo {{")).toBe("");
  });
  it("returns null with no open brace", () => {
    expect(activeVarQuery("echo hello")).toBeNull();
  });
  it("returns null once the variable is closed", () => {
    expect(activeVarQuery("echo {{done}}")).toBeNull();
  });
  it("tracks the last open brace when several exist", () => {
    expect(activeVarQuery("{{a}} then {{b")).toBe("b");
  });
});

describe("insertVarAt", () => {
  it("replaces the partial query with the full variable", () => {
    const r = insertVarAt("echo {{na", 9, 9, "name");
    expect(r.value).toBe("echo {{name}}");
    expect(r.cursor).toBe(13);
  });
  it("wraps a fresh variable when there is no open brace", () => {
    const r = insertVarAt("echo ", 5, 5, "date");
    expect(r.value).toBe("echo {{date}}");
    expect(r.cursor).toBe(13);
  });
  it("replaces a selection with a fresh variable", () => {
    const r = insertVarAt("echo XX end", 5, 7, "v");
    expect(r.value).toBe("echo {{v}} end");
    expect(r.cursor).toBe(10);
  });
});

describe("filterDynamicVars", () => {
  it("prefix-matches case-insensitively", () => {
    expect(filterDynamicVars(DYNAMIC_VAR_DEF_KEYS, "conn").every((d) => d.value.startsWith("connection"))).toBe(true);
    expect(filterDynamicVars(DYNAMIC_VAR_DEF_KEYS, "DA").map((d) => d.value)).toEqual(["date", "datetime"]);
  });
  it("returns all defs for an empty query", () => {
    expect(filterDynamicVars(DYNAMIC_VAR_DEF_KEYS, "")).toHaveLength(DYNAMIC_VAR_DEF_KEYS.length);
  });
});
