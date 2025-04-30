import "server-only";

import { withTracing } from "@/lib/utils/tracing";
import { safeParse, t, type StaticDecode } from "@/lib/utils/typebox";

// Import the configured client instance from the correct location
import { client as minioClient } from "@/lib/settlemint/minio";

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
      const objectsStream = minioClient.listObjects(
        DEFAULT_BUCKET,
        prefix,
        true
      );

      const objectsData: any[] = [];
      for await (const obj of objectsStream) {
        objectsData.push(obj);
      }
      console.log(`Found ${objectsData.length} files in Minio`);

      const fileObjects = await Promise.all(
        objectsData.map(async (obj) => {
          const url = await minioClient.presignedGetObject(
            DEFAULT_BUCKET,
            obj.name,
            3600
          );

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
      const statResult = await minioClient.statObject(DEFAULT_BUCKET, fileId);

      const url = await minioClient.presignedGetObject(
        DEFAULT_BUCKET,
        fileId,
        3600
      );

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

      const metadata = {
        "content-type": file.type,
        "original-name": file.name,
        "upload-time": new Date().toISOString(),
      };

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await minioClient.putObject(
        DEFAULT_BUCKET,
        objectName,
        buffer,
        buffer.length,
        metadata
      );

      const url = await minioClient.presignedGetObject(
        DEFAULT_BUCKET,
        objectName,
        3600
      );

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
      console.error("Failed to upload file:", error);
      return null;
    }
  }
);

/**
 * Deletes a file from storage with enhanced reliability
 *
 * @param fileId - The file identifier/path to delete
 * @returns Success status and details
 */
export const deleteFile = withTracing(
  "queries",
  "deleteFile",
  async (
    fileId: string
  ): Promise<{
    success: boolean;
    message: string;
    error?: any;
  }> => {
    console.log(
      `Attempting to delete file: ${fileId} from bucket: ${DEFAULT_BUCKET}`
    );

    if (!fileId) {
      return {
        success: false,
        message: "No file ID provided",
      };
    }

    try {
      // First check if file exists
      let fileExists = true;
      let fileInfo = null;
      try {
        fileInfo = await minioClient.statObject(DEFAULT_BUCKET, fileId);
        console.log(
          `File exists with size: ${fileInfo.size}, last modified: ${fileInfo.lastModified}`
        );
      } catch (statError: any) {
        fileExists = false;
        // If file doesn't exist, consider the deletion successful
        if (statError.code === "NotFound") {
          console.log(
            `File not found at path: ${fileId} - considering deletion successful`
          );
          return {
            success: true,
            message: "File does not exist (already deleted)",
          };
        }
        console.log(`Error checking file existence: ${statError.message}`);
      }

      if (fileExists) {
        // Remove the file
        await minioClient.removeObject(DEFAULT_BUCKET, fileId);

        // Verify deletion success
        let stillExists = false;
        try {
          await minioClient.statObject(DEFAULT_BUCKET, fileId);
          stillExists = true;
        } catch (verifyError) {
          // This is good - file should be gone
          stillExists = false;
        }

        if (stillExists) {
          console.error(`File still exists after deletion attempt: ${fileId}`);
          return {
            success: false,
            message: "File still exists after deletion attempt",
          };
        }

        return {
          success: true,
          message: "File successfully deleted",
        };
      }

      // Fall through to failure if we couldn't confirm existence but also not a clear "not found"
      return {
        success: false,
        message: "Could not confirm file status",
      };
    } catch (error) {
      console.error(`Failed to delete file ${fileId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        error,
      };
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

      const url = await minioClient.presignedPutObject(
        DEFAULT_BUCKET,
        objectName,
        expirySeconds
      );

      return url;
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

      const metadata = {
        "content-type": file.type,
        "original-name": file.name,
        "upload-time": new Date().toISOString(),
      };

      console.log(`Uploading PDF file ${fileName} using simplified approach`);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await minioClient.putObject(
        DEFAULT_BUCKET,
        objectName,
        buffer,
        buffer.length,
        metadata
      );

      const url = await minioClient.presignedGetObject(
        DEFAULT_BUCKET,
        objectName,
        3600
      );

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
