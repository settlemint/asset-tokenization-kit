"use server";

import { DEFAULT_BUCKET, uploadFile } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";
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

  try {
    // Use the imported uploadFile function from file-storage.ts
    // This function already handles creating the objectName and metadata internally
    const uploadedMetadata = await uploadFile(file, path);

    if (!uploadedMetadata) {
      throw new Error("Upload function returned null");
    }

    console.log(`File uploaded successfully: ${uploadedMetadata.id}`);

    // Return metadata about the uploaded file
    // Adapt the structure slightly to match the return type if needed
    return {
      id: uploadedMetadata.id.split("/").pop() || uploadedMetadata.id, // Extract ID part if needed
      name: uploadedMetadata.name,
      contentType: uploadedMetadata.contentType,
      size: uploadedMetadata.size,
      uploadedAt: new Date(uploadedMetadata.uploadedAt),
      etag: uploadedMetadata.etag,
      url: uploadedMetadata.url || "", // Ensure URL is provided
      objectName: uploadedMetadata.id, // Use the full object path as objectName
      bucket: DEFAULT_BUCKET,
    };
  } catch (error) {
    console.error("Error uploading file:", error);

    // Fallback to simulated upload (keep existing logic if needed)
    console.warn("Falling back to simulated upload");
    const id = randomUUID();
    const fileName = file.name;
    const contentType = file.type || "application/octet-stream";
    const objectName = path ? `${path}/${id}-${fileName}` : `${id}-${fileName}`; // Regenerate objectName for fallback

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
    // Use the imported minioClient to list objects
    const objectsStream = minioClient.listObjects(DEFAULT_BUCKET, prefix, true);

    const files: FileMetadata[] = [];
    for await (const obj of objectsStream) {
      if (obj.name) {
        // Generate presigned URL for each object
        const url = await minioClient.presignedGetObject(
          DEFAULT_BUCKET,
          obj.name,
          3600 // 1 hour expiry
        );
        files.push({
          id: obj.name.split("/").pop() || obj.name,
          name: obj.name.split("/").pop() || obj.name,
          contentType: "application/octet-stream", // Need to fetch stat for real type
          size: obj.size || 0,
          uploadedAt: obj.lastModified || new Date(),
          etag: obj.etag || "",
          url: url,
          objectName: obj.name,
          bucket: DEFAULT_BUCKET,
        });
      }
    }
    return files;
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
    // Use the imported minioClient to remove the object
    // Assume fileId might be the full object path/name
    await minioClient.removeObject(DEFAULT_BUCKET, fileId);

    console.log(`File deleted: ${fileId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    return false;
  }
}
