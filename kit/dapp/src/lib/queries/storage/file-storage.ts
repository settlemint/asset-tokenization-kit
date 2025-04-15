import "server-only";

import {
  createDeleteOperation,
  createListObjectsOperation,
  createPresignedPutOperation,
  createPresignedUrlOperation,
  createSimpleUploadOperation,
  createStatObjectOperation,
  createUploadOperation,
  executeMinioOperation,
  minioClient,
} from "@/lib/storage/minio-client";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * Schema for file metadata
 */
export const FileMetadataSchema = t.Object(
  {
    id: t.String(),
    name: t.String(),
    contentType: t.String(),
    size: t.Number(),
    uploadedAt: t.String({ format: "date-time" }),
    etag: t.String(),
    url: t.Optional(t.String({ format: "uri" })),
  },
  { $id: "FileMetadata" }
);

export type FileMetadata = StaticDecode<typeof FileMetadataSchema>;

/**
 * Default bucket to use for file storage
 * Changed from 'asset-files' to a more common bucket name that might already exist
 */
export const DEFAULT_BUCKET = "uploads";

/**
 * Gets a list of files with optional prefix filter
 *
 * @param prefix - Optional prefix to filter files (like a folder path)
 * @param skipCache - Whether to skip cache and always fetch fresh data (no longer used)
 * @returns Array of file metadata objects
 */
export const getFilesList = withTracing(
  "queries",
  "getFilesList",
  async (
    prefix: string = "",
    skipCache: boolean = false
  ): Promise<FileMetadata[]> => {
    console.log(`Listing files with prefix: "${prefix}"`);

    try {
      const listOperation = createListObjectsOperation(DEFAULT_BUCKET, prefix);
      const objects = await executeMinioOperation(listOperation);
      console.log(`Found ${objects.length} files in Minio`);

      const fileObjects = await Promise.all(
        objects.map(async (obj) => {
          const presignedUrlOperation = createPresignedUrlOperation(
            DEFAULT_BUCKET,
            obj.name,
            3600
          );
          const url = await executeMinioOperation(presignedUrlOperation);

          return {
            id: obj.name,
            name: obj.name.split("/").pop() || obj.name,
            contentType: "application/octet-stream", // Default type
            size: obj.size,
            uploadedAt: obj.lastModified.toISOString(),
            etag: obj.etag,
            url,
          };
        })
      );

      return safeParse(t.Array(FileMetadataSchema), fileObjects);
    } catch (error) {
      console.error("Failed to list files:", error);
      return [];
    }
  }
);

/**
 * Gets a single file by its path/id
 *
 * @param fileId - The file identifier/path
 * @returns File metadata with presigned URL
 */
export const getFileById = withTracing(
  "queries",
  "getFileById",
  async (fileId: string): Promise<FileMetadata | null> => {
    console.log(`Getting file details for: ${fileId}`);

    try {
      // Get the file metadata
      const statOperation = createStatObjectOperation(DEFAULT_BUCKET, fileId);
      const statResult = await executeMinioOperation(statOperation);

      // Generate a presigned URL for access
      const presignedUrlOperation = createPresignedUrlOperation(
        DEFAULT_BUCKET,
        fileId,
        3600
      );
      const url = await executeMinioOperation(presignedUrlOperation);

      const fileMetadata = {
        id: fileId,
        name: fileId.split("/").pop() || fileId,
        contentType:
          statResult.metaData["content-type"] || "application/octet-stream",
        size: statResult.size,
        uploadedAt: statResult.lastModified.toISOString(),
        etag: statResult.etag,
        url,
      };

      return safeParse(FileMetadataSchema, fileMetadata);
    } catch (error) {
      console.error(`Failed to get file ${fileId}:`, error);
      return null;
    }
  }
);

/**
 * Uploads a file to storage
 *
 * @param file - The file to upload
 * @param path - Optional path/folder to store the file in
 * @returns The uploaded file metadata
 */
export const uploadFile = withTracing(
  "queries",
  "uploadFile",
  async (file: File, path: string = ""): Promise<FileMetadata | null> => {
    try {
      const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectName = path ? `${path}/${fileName}` : fileName;

      // Add file metadata
      const metadata = {
        "content-type": file.type,
        "original-name": file.name,
        "upload-time": new Date().toISOString(),
      };

      // Upload the file
      const uploadOperation = createUploadOperation(
        DEFAULT_BUCKET,
        objectName,
        file,
        metadata
      );
      const result = await executeMinioOperation(uploadOperation);

      // Generate a presigned URL for immediate access
      const presignedUrlOperation = createPresignedUrlOperation(
        DEFAULT_BUCKET,
        objectName,
        3600
      );
      const url = await executeMinioOperation(presignedUrlOperation);

      const fileMetadata = {
        id: objectName,
        name: fileName,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        etag: result.etag,
        url,
      };

      // Don't use cacheTag here as it's not in a "use cache" function
      // Instead, we'll handle cache invalidation differently

      return safeParse(FileMetadataSchema, fileMetadata);
    } catch (error) {
      console.error("Failed to upload file:", error);
      return null;
    }
  }
);

/**
 * Deletes a file from storage
 *
 * @param fileId - The file identifier/path to delete
 * @returns Success status
 */
export const deleteFile = withTracing(
  "queries",
  "deleteFile",
  async (fileId: string): Promise<boolean> => {
    try {
      const deleteOperation = createDeleteOperation(DEFAULT_BUCKET, fileId);
      await executeMinioOperation(deleteOperation);

      // Don't use cacheTag here as it's not in a "use cache" function

      return true;
    } catch (error) {
      console.error(`Failed to delete file ${fileId}:`, error);
      return false;
    }
  }
);

/**
 * Function to create a presigned upload URL for direct browser uploads
 *
 * @param fileName - The file name to use
 * @param contentType - The content type of the file
 * @param path - Optional path/folder
 * @param expirySeconds - How long the URL should be valid for
 * @returns Presigned URL for PUT operation
 */
export const createPresignedUploadUrl = withTracing(
  "queries",
  "createPresignedUploadUrl",
  async (
    fileName: string,
    contentType: string,
    path: string = "",
    expirySeconds: number = 3600
  ): Promise<string | null> => {
    try {
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectName = path ? `${path}/${safeFileName}` : safeFileName;

      // Create operation for presigned PUT URL
      const presignedPutOperation = createPresignedPutOperation(
        DEFAULT_BUCKET,
        objectName,
        expirySeconds,
        { "content-type": contentType }
      );

      return await executeMinioOperation(presignedPutOperation);
    } catch (error) {
      console.error("Failed to create presigned upload URL:", error);
      return null;
    }
  }
);

/**
 * Uploads a PDF file to storage using a simplified approach
 *
 * @param file - The PDF file to upload
 * @param path - Optional path/folder to store the file in
 * @returns The uploaded file metadata
 */
export const uploadPdfFile = withTracing(
  "queries",
  "uploadPdfFile",
  async (file: File, path: string = ""): Promise<FileMetadata | null> => {
    try {
      const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const objectName = path ? `${path}/${fileName}` : fileName;

      // Add file metadata
      const metadata = {
        "content-type": file.type,
        "original-name": file.name,
        "upload-time": new Date().toISOString(),
      };

      // Upload the file with simplified approach
      console.log(`Uploading PDF file ${fileName} using simplified approach`);

      // Get the upload function from createSimpleUploadOperation with minioClient
      const simpleUploadFn = createSimpleUploadOperation(minioClient);

      // Use the function directly with our parameters
      const result = await simpleUploadFn(
        file,
        DEFAULT_BUCKET,
        objectName,
        metadata
      );

      // Generate a presigned URL for immediate access
      const presignedUrlOperation = createPresignedUrlOperation(
        DEFAULT_BUCKET,
        objectName,
        3600
      );
      const url = await executeMinioOperation(presignedUrlOperation);

      const fileMetadata = {
        id: objectName,
        name: fileName,
        contentType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        etag: result.etag,
        url,
      };

      return safeParse(FileMetadataSchema, fileMetadata);
    } catch (error) {
      console.error("Failed to upload PDF file:", error);
      return null;
    }
  }
);
