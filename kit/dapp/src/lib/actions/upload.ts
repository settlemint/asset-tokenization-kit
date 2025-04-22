"use server";

import { uploadFile } from "@/lib/storage/minio-client";
import { randomUUID } from "crypto";

export interface FileMetadata {
  id: string;
  name: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
  etag: string;
  url: string;
  objectName: string;
  bucket?: string;
}

/**
 * Server action to upload a file to MinIO storage
 */
export async function uploadToStorage(
  formData: FormData
): Promise<FileMetadata> {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  // Generate a unique object name
  const fileName = file.name;
  const id = randomUUID();
  const objectName = `${id}-${fileName}`;
  const contentType = file.type || "application/octet-stream";

  // Convert file to buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // Use MinIO client to upload the file
    const bucketName = process.env.MINIO_DEFAULT_BUCKET || "asset-tokenization";
    const result = await uploadFile(
      buffer,
      objectName,
      contentType,
      {
        "Content-Type": contentType,
        "Original-Filename": fileName,
      },
      bucketName
    );

    console.log(`File uploaded successfully: ${objectName}`);

    // Return metadata about the uploaded file
    return {
      id,
      name: fileName,
      contentType,
      size: file.size,
      uploadedAt: new Date(),
      etag: typeof result.etag === "string" ? result.etag : id,
      url: result.url || `/api/files/${id}`,
      objectName,
      bucket: bucketName,
    };
  } catch (error) {
    console.error("Error uploading to MinIO:", error);

    // Fallback to simulated upload
    console.warn("Falling back to simulated upload");

    // Return simulated metadata
    return {
      id,
      name: fileName,
      contentType,
      size: file.size,
      uploadedAt: new Date(),
      etag: id,
      url: `/api/files/${id}`,
      objectName,
    };
  }
}

/**
 * List all uploaded files
 */
export async function listFiles(): Promise<FileMetadata[]> {
  try {
    // TODO: Implement MinIO's listObjects functionality
    // const minioClient = createMinioClient();
    // const bucketName = process.env.MINIO_DEFAULT_BUCKET || "asset-tokenization";
    // const objects = await minioClient.listObjects(bucketName, "documents/", true);

    // For now, return an empty array as we don't have persistent storage
    return [];
  } catch (error) {
    console.error("Error listing files:", error);
    return [];
  }
}
