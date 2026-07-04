import { sftpUpload, sftpDownload, sftpUploadDirTar, sftpDownloadDirTar } from "@/services/sftp";
import { genId } from "@/components/filetransfer/SFTPTypes";
import type { LeafStep } from "./snippetFlatten";

type TransferStep = Extract<LeafStep, { kind: "transfer" }>;

export async function runTransferStep(sftpId: string, step: TransferStep): Promise<void> {
  const transferId = genId();
  const { local_path: localPath, remote_path: remotePath } = step;
  if (step.direction === "upload") {
    if (step.is_dir) await sftpUploadDirTar({ sftpId, localPath, remotePath, transferId });
    else await sftpUpload({ sftpId, localPath, remotePath, transferId });
  } else {
    if (step.is_dir) await sftpDownloadDirTar({ sftpId, localPath, remotePath, transferId });
    else await sftpDownload({ sftpId, localPath, remotePath, transferId });
  }
}
