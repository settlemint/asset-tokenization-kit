"use server";

import fs from "node:fs/promises";
import path from "node:path";

export async function uploadFile(meta: { name: string; uploadDir: string }, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const files = formData.getAll(meta.name) as File[];
  const uploadsDir = path.join(process.cwd(), meta.uploadDir);
  await fs.mkdir(uploadsDir, { recursive: true });

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    await fs.writeFile(`${uploadsDir}/${file.name}`, bytes);
  }

  return { message: `${files.length} file(s) uploaded successfully` };
}
