import { describe, it, expect } from "vitest";
import { languageForPath } from "./languageForPath";

describe("languageForPath", () => {
  it("maps known extensions", () => {
    expect(languageForPath("/srv/app.ts")).not.toBeNull();
    expect(languageForPath("config.JSON")).not.toBeNull();
    expect(languageForPath("main.py")).not.toBeNull();
  });

  it("maps shell scripts", () => {
    for (const p of ["deploy.sh", "run.bash", "x.zsh", "y.ksh"])
      expect(languageForPath(p), p).not.toBeNull();
  });

  it("maps config formats (toml / ini / conf / properties)", () => {
    for (const p of ["Cargo.toml", "app.ini", "nginx.conf", "db.cfg", "x.properties"])
      expect(languageForPath(p), p).not.toBeNull();
  });

  it("maps systems languages (go / c / cpp / headers)", () => {
    for (const p of ["main.go", "a.c", "a.h", "a.cpp", "a.cc", "a.cxx", "a.hpp"])
      expect(languageForPath(p), p).not.toBeNull();
  });

  it("maps a few more common languages", () => {
    for (const p of ["A.java", "s.rb", "init.lua", "app.swift", "P.cs", "Main.kt", "x.pl", "run.ps1"])
      expect(languageForPath(p), p).not.toBeNull();
  });

  it("maps extension-less well-known filenames", () => {
    for (const p of ["/app/Dockerfile", "Dockerfile.dev", "/home/u/.bashrc", ".zshrc", ".profile"])
      expect(languageForPath(p), p).not.toBeNull();
  });

  it("maps well-known dot config files", () => {
    for (const p of [".gitconfig", ".editorconfig", ".npmrc", ".env", ".env.local"])
      expect(languageForPath(p), p).not.toBeNull();
  });

  it("returns null for unknown / extensionless", () => {
    expect(languageForPath("/etc/hosts")).toBeNull();
    expect(languageForPath("binary.xyz")).toBeNull();
    expect(languageForPath("README")).toBeNull();
  });
});
