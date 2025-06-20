"use server";

import {
  DEFAULT_BUCKET,
  deleteFile as deleteStorageFile,
} from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";

/**
 * Enhanced server action for reliably deleting files from MinIO storage
 * Uses the improved deleteFile function from file-storage.ts and adds fallback mechanisms
 */
export async function deleteFile(fileId: string): Promise<{
  success: boolean;
  message: string;
  error?: any;
}> {
  if (!fileId) {
    return {
      success: false,
      message: "No file ID provided",
    };
  }

  console.log(
    `Enhanced Delete: Attempting to delete file: ${fileId} from bucket: ${DEFAULT_BUCKET}`
  );

  try {
    // First attempt: Use the primary storage function
    console.log("Attempt 1: Using primary storage delete function");
    const result = await deleteStorageFile(fileId);

    if (result.success) {
      return result;
    }

    console.log(`Primary delete function failed: ${result.message}`);

    // Second attempt: Try to find files with similar paths
    console.log("Attempt 2: Searching for files with similar paths");
    const objectsStream = minioClient.listObjects(DEFAULT_BUCKET, "", true);
    const allObjects: string[] = [];
    const potentialMatches: string[] = [];

    // List all files and identify potential matches
    for await (const obj of objectsStream) {
      if (obj.name) {
        allObjects.push(obj.name);

        if (
          obj.name === fileId ||
          obj.name.endsWith(`/${fileId}`) ||
          obj.name.includes(fileId) ||
          (fileId.includes("/") &&
            obj.name.includes(fileId.split("/").pop() || ""))
        ) {
          potentialMatches.push(obj.name);
        }
      }
    }

    console.log(`Found ${allObjects.length} total files in bucket`);
    console.log(
      `Found ${potentialMatches.length} potential matches:`,
      potentialMatches
    );

    // Try to delete all potential matches
    if (potentialMatches.length > 0) {
      for (const matchPath of potentialMatches) {
        try {
          console.log(`Attempting to delete potential match: ${matchPath}`);
          const matchResult = await deleteStorageFile(matchPath);

          if (matchResult.success) {
            console.log(`Successfully deleted match: ${matchPath}`);
            return {
              success: true,
              message: `Successfully deleted file using path: ${matchPath}`,
            };
          }
        } catch (e) {
          console.error(`Error deleting match ${matchPath}:`, e);
        }
      }
    }

    // Third attempt: Try with direct client
    console.log("Attempt 3: Using direct MinIO client");
    try {
      await minioClient.removeObject(DEFAULT_BUCKET, fileId);

      // Verify deletion
      let stillExists = false;
      try {
        await minioClient.statObject(DEFAULT_BUCKET, fileId);
        stillExists = true;
      } catch (_e) {
        // Expected - file should be gone
        stillExists = false;
      }

      if (!stillExists) {
        return {
          success: true,
          message: "Successfully deleted using direct client",
        };
      }
    } catch (directError) {
      console.error("Direct client deletion failed:", directError);
    }

    // All attempts failed
    return {
      success: false,
      message: "All deletion attempts failed",
      error: result.error,
    };
  } catch (error) {
    console.error(`Unexpected error during file deletion:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    };
  }
}
