import { describe, it, expect, vi, beforeEach } from "vitest";

const sftpUpload = vi.fn(async () => {});
const sftpDownload = vi.fn(async () => {});
const sftpUploadDirTar = vi.fn(async () => {});
const sftpDownloadDirTar = vi.fn(async () => {});
vi.mock("@/services/sftp", () => ({
  sftpUpload: (...a: unknown[]) => sftpUpload(...a),
  sftpDownload: (...a: unknown[]) => sftpDownload(...a),
  sftpUploadDirTar: (...a: unknown[]) => sftpUploadDirTar(...a),
  sftpDownloadDirTar: (...a: unknown[]) => sftpDownloadDirTar(...a),
}));
vi.mock("@/components/filetransfer/SFTPTypes", () => ({ genId: () => "tid" }));

import { runTransferStep } from "./snippetSequence";

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
