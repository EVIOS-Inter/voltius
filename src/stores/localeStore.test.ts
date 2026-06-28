import { describe, it, expect, beforeEach } from "vitest";
import { useLocaleStore, SUPPORTED_LOCALES } from "./localeStore";
import { useAppSettingsTimestampStore } from "./appSettingsTimestampStore";

describe("localeStore", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "en" });
  });

  it("defaults to English", () => {
    expect(useLocaleStore.getState().locale).toBe("en");
  });

  it("setLocale updates the locale", () => {
    useLocaleStore.getState().setLocale("fr");
    expect(useLocaleStore.getState().locale).toBe("fr");
  });

  it("setLocale bumps the app-settings sync timestamp", () => {
    useAppSettingsTimestampStore.setState({ updatedAt: new Date(0).toISOString() });
    useLocaleStore.getState().setLocale("fr");
    expect(useAppSettingsTimestampStore.getState().updatedAt).not.toBe(new Date(0).toISOString());
  });

  it("exposes English and French as supported locales", () => {
    const values = SUPPORTED_LOCALES.map((l) => l.value);
    expect(values).toContain("en");
    expect(values).toContain("fr");
  });
});
