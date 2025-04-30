"use server";

import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";

/**
 * @deprecated This direct delete function is deprecated and will be removed in a future version.
 * Please use the new consolidated `/lib/actions/delete-file.ts` implementation instead for better reliability.
 *
 * Server action that directly deletes a file from MinIO without
 * going through the existing deleteFile function
 */
export async function deleteFileDirect(fileId: string): Promise<{
  success: boolean;
  message: string;
  error?: any;
}> {
  console.log(
    `DEPRECATED Direct File Delete: Attempting to delete file: ${fileId} from bucket: ${DEFAULT_BUCKET}`
  );

  // Log MinIO config info (safe values only)
  console.log("MinIO configuration:", {
    bucket: DEFAULT_BUCKET,
    endpoint: process.env.SETTLEMINT_MINIO_ENDPOINT
      ? process.env.SETTLEMINT_MINIO_ENDPOINT.substring(0, 20) + "..."
      : "Not set",
    hasAccessKey: !!process.env.SETTLEMINT_MINIO_ACCESS_KEY,
    hasSecretKey: !!process.env.SETTLEMINT_MINIO_SECRET_KEY,
  });

  try {
    // First check if file exists
    console.log(`Checking if file exists: ${fileId}`);
    try {
      const stat = await minioClient.statObject(DEFAULT_BUCKET, fileId);
      console.log(
        `File exists with size: ${stat.size}, last modified: ${stat.lastModified}`
      );
    } catch (statError) {
      console.error(
        `File not found or error getting stats: ${fileId}`,
        statError
      );
      return {
        success: false,
        message: `File not found or cannot access: ${fileId}`,
        error: statError,
      };
    }

    // Try to delete the file directly
    await minioClient.removeObject(DEFAULT_BUCKET, fileId);

    // Verify deletion
    let exists = false;
    try {
      await minioClient.statObject(DEFAULT_BUCKET, fileId);
      exists = true;
    } catch (statError) {
      // This is expected - file should be gone
      exists = false;
    }

    if (exists) {
      console.error(`File still exists after deletion attempt: ${fileId}`);
      return {
        success: false,
        message: "File still exists after deletion attempt",
      };
    }

    console.log(`Successfully deleted file: ${fileId}`);
    return {
      success: true,
      message: "File successfully deleted",
    };
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    return {
      success: false,
      message:
        "Failed to delete file: " +
        (error instanceof Error ? error.message : "Unknown error"),
      error,
    };
  }
}
