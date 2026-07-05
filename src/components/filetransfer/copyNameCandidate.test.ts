import { describe, it, expect } from "vitest";
import { copyNameCandidate } from "./copyNameCandidate";

describe("copyNameCandidate", () => {
  it("returns the original name at n=0", () => {
    expect(copyNameCandidate("report.txt", false, 0)).toBe("report.txt");
    expect(copyNameCandidate("photos", true, 0)).toBe("photos");
  });
  it("inserts ' - Copy' before the extension for files", () => {
    expect(copyNameCandidate("report.txt", false, 1)).toBe("report - Copy.txt");
    expect(copyNameCandidate("report.txt", false, 2)).toBe("report - Copy (2).txt");
    expect(copyNameCandidate("report.txt", false, 3)).toBe("report - Copy (3).txt");
  });
  it("appends ' - Copy' to directory names", () => {
    expect(copyNameCandidate("photos", true, 1)).toBe("photos - Copy");
    expect(copyNameCandidate("photos", true, 2)).toBe("photos - Copy (2)");
  });
  it("treats a leading-dot name as having no extension", () => {
    expect(copyNameCandidate(".bashrc", false, 1)).toBe(".bashrc - Copy");
  });
  it("splits on the last dot only", () => {
    expect(copyNameCandidate("archive.tar.gz", false, 1)).toBe("archive.tar - Copy.gz");
  });
  it("handles a file with no extension", () => {
    expect(copyNameCandidate("Makefile", false, 1)).toBe("Makefile - Copy");
  });
});
