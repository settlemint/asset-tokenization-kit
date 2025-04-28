"use server";

import { DEFAULT_BUCKET } from "@/lib/queries/storage/file-storage";
import { client as minioClient } from "@/lib/settlemint/minio";

/**
 * Server action to test MinIO access and operations
 */
export async function testMinioList() {
  try {
    console.log("TEST MINIO: Listing objects in bucket:", DEFAULT_BUCKET);

    const objectsStream = minioClient.listObjects(DEFAULT_BUCKET, "", true);
    const objects: string[] = [];

    for await (const obj of objectsStream) {
      if (obj.name) {
        objects.push(obj.name);
      }
    }

    console.log(`TEST MINIO: Found ${objects.length} objects in bucket`);
    return {
      success: true,
      count: objects.length,
      objects: objects.slice(0, 20), // Return first 20 objects to avoid too much data
      bucket: DEFAULT_BUCKET,
    };
  } catch (error) {
    console.error("TEST MINIO: Error listing objects:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server action to test MinIO deletion operations
 */
export async function testMinioDelete(path: string) {
  if (!path) {
    return {
      success: false,
      error: "No path provided",
    };
  }

  try {
    console.log(
      `TEST MINIO: Attempting to delete: ${path} from bucket: ${DEFAULT_BUCKET}`
    );

    await minioClient.removeObject(DEFAULT_BUCKET, path);

    console.log(`TEST MINIO: Successfully deleted: ${path}`);
    return {
      success: true,
      message: `Successfully deleted file: ${path}`,
      path: path,
      bucket: DEFAULT_BUCKET,
    };
  } catch (error) {
    console.error("TEST MINIO: Error deleting object:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      path: path,
    };
  }
}
