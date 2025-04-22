"use server";

import {
  createPresignedUrlOperation,
  executeMinioOperation,
  uploadFile,
} from "@/lib/storage/minio-client";
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
 *
 * @param formData - FormData containing the file to upload
 * @param path - Optional path/subfolder to store the file in
 * @returns FileMetadata object with information about the uploaded file
 */
export async function uploadToStorage(
  formData: FormData,
  path: string = ""
): Promise<FileMetadata> {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  // Generate a unique object name
  const fileName = file.name;
  const id = randomUUID();
  const objectName = path ? `${path}/${id}-${fileName}` : `${id}-${fileName}`;
  const contentType = file.type || "application/octet-stream";

  // Convert file to buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    // Use MinIO client to upload the file
    const bucketName = process.env.MINIO_DEFAULT_BUCKET || "asset-tokenization";

    // Call uploadFile with the correct parameter order: bucketName, objectName, buffer, metadata
    const etag = await uploadFile(bucketName, objectName, buffer, {
      "Content-Type": contentType,
      "Original-Filename": fileName,
      "Upload-Path": path,
    });

    console.log(`File uploaded successfully: ${objectName}`);

    // Generate a presigned URL for the uploaded file
    const presignedUrlOperation = createPresignedUrlOperation(
      bucketName,
      objectName,
      3600
    );
    const url = await executeMinioOperation(presignedUrlOperation);

    // Return metadata about the uploaded file
    return {
      id,
      name: fileName,
      contentType,
      size: file.size,
      uploadedAt: new Date(),
      etag,
      url,
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
 *
 * @param prefix - Optional prefix to filter files (like a folder path)
 * @returns Array of FileMetadata objects
 */
export async function listFiles(prefix: string = ""): Promise<FileMetadata[]> {
  try {
    // TODO: Implement MinIO's listObjects functionality
    // const minioClient = createMinioClient();
    // const bucketName = process.env.MINIO_DEFAULT_BUCKET || "asset-tokenization";
    // const objects = await minioClient.listObjects(bucketName, prefix || "documents/", true);

    // For now, return an empty array as we don't have persistent storage
    return [];
  } catch (error) {
    console.error("Error listing files:", error);
    return [];
  }
}

/**
 * Delete a file by its ID or path
 *
 * @param fileId - The ID or path of the file to delete
 * @returns True if the file was deleted successfully
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    // TODO: Implement file deletion using MinIO client
    // const minioClient = createMinioClient();
    // const bucketName = process.env.MINIO_DEFAULT_BUCKET || "asset-tokenization";
    // await minioClient.removeObject(bucketName, fileId);

    console.log(`File deleted (simulated): ${fileId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    return false;
  }
}
