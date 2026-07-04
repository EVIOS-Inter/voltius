import { describe, it, expect, vi, beforeEach } from "vitest";

const sftpUpload = vi.fn(async (..._a: unknown[]) => {});
const sftpDownload = vi.fn(async (..._a: unknown[]) => {});
const sftpUploadDirTar = vi.fn(async (..._a: unknown[]) => {});
const sftpDownloadDirTar = vi.fn(async (..._a: unknown[]) => {});
vi.mock("@/services/sftp", () => ({
  sftpUpload: (...a: unknown[]) => sftpUpload(...a),
  sftpDownload: (...a: unknown[]) => sftpDownload(...a),
  sftpUploadDirTar: (...a: unknown[]) => sftpUploadDirTar(...a),
  sftpDownloadDirTar: (...a: unknown[]) => sftpDownloadDirTar(...a),
}));
vi.mock("@/components/filetransfer/SFTPTypes", () => ({ genId: () => "tid" }));

import { runTransferStep, executeSequenceForTargets } from "./snippetSequence";

beforeEach(() => { sftpUpload.mockClear(); sftpDownload.mockClear(); sftpUploadDirTar.mockClear(); sftpDownloadDirTar.mockClear(); });

describe("runTransferStep", () => {
  it("uploads a file", async () => {
    await runTransferStep("sid", { kind: "transfer", direction: "upload", local_path: "/l", remote_path: "/r", is_dir: false });
    expect(sftpUpload).toHaveBeenCalledWith({ sftpId: "sid", localPath: "/l", remotePath: "/r", transferId: "tid" });
  });

  it("downloads a directory via tar", async () => {
    await runTransferStep("sid", { kind: "transfer", direction: "download", local_path: "/l", remote_path: "/r", is_dir: true });
    expect(sftpDownloadDirTar).toHaveBeenCalledWith({ sftpId: "sid", localPath: "/l", remotePath: "/r", transferId: "tid" });
  });
});

describe("executeSequenceForTargets", () => {
  it("isolates target failures and reports per-target outcome", async () => {
    const good = { runScript: vi.fn(async () => {}), runTransfer: vi.fn(async () => {}), close: vi.fn(async () => {}) };
    const bad = { runScript: vi.fn(async () => { throw new Error("perm denied"); }), runTransfer: vi.fn(async () => {}), close: vi.fn(async () => {}) };
    const leaf = [{ kind: "script", content: "x" }] as const;
    const res = await executeSequenceForTargets(
      leaf as never,
      [
        { label: "web-1", exec: good },
        { label: "web-2", exec: bad },
      ],
    );
    expect(res.targets.find((t) => t.label === "web-1")?.ok).toBe(true);
    expect(res.targets.find((t) => t.label === "web-2")?.ok).toBe(false);
    expect(res.targets.find((t) => t.label === "web-2")?.error).toMatch(/perm denied/);
  });
});
