"use server";

import fs from "node:fs/promises";
import path from "node:path";

declare global {
  var uploadProgressManager: UploadProgressManager | undefined;
}

class UploadProgressManager {
  private progress: Map<string, number>;

  constructor() {
    this.progress = new Map<string, number>();
  }

  public setProgress(id: string, value: number): void {
    this.progress.set(id, value);
  }

  public getProgress(id: string): number {
    return this.progress.get(id) || 0;
  }
}

function getUploadProgressManager(): UploadProgressManager {
  if (!global.uploadProgressManager) {
    global.uploadProgressManager = new UploadProgressManager();
  }
  return global.uploadProgressManager;
}

export async function uploadFile(meta: { name: string; uploadDir: string; id: string }, formData: FormData) {
  const files = formData.getAll(meta.name) as File[];
  const uploadsDir = path.join(process.cwd(), meta.uploadDir);
  await fs.mkdir(uploadsDir, { recursive: true });

  const progressManager = getUploadProgressManager();
  progressManager.setProgress(meta.id, 0);

  const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
  let uploadedBytes = 0;

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    const chunkSize = 1024; // 1MB chunks
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize);
      await fs.writeFile(`${uploadsDir}/${file.name}`, chunk, { flag: "a" });
      uploadedBytes += chunk.length;
      const progress = Math.round((uploadedBytes / totalBytes) * 100);
      console.log("PROGRESS3", meta.id, progress);
      progressManager.setProgress(meta.id, progress);
    }
  }
  progressManager.setProgress(meta.id, 100);
  return { message: `${files.length} file(s) uploaded successfully`, data: { id: meta.id } };
}

export async function getUploadProgress(id: string): Promise<number> {
  const progressManager = getUploadProgressManager();
  const progress = progressManager.getProgress(id);
  return progress;
}
