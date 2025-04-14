import { client } from "@/lib/settlemint/minio";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import fs from "fs";
import "server-only";
import { Readable } from "stream";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * Extended client type with additional methods
 */
type ExtendedMinioClient = typeof client & {
  presignedPutObject(
    bucketName: string,
    objectName: string,
    expirySeconds?: number,
    reqParams?: Record<string, string>
  ): Promise<string>;
  uploadObject(
    bucketName: string,
    objectName: string,
    data: File | Blob | ArrayBuffer | Buffer,
    metadata?: Record<string, string>
  ): Promise<{ etag: string }>;
};

// Cast the client to include additional methods
export const minioClient = client as ExtendedMinioClient;

/**
 * Operation type for Minio operations
 */
export type MinioOperation<T = unknown> = {
  operation: string;
  execute: () => Promise<T>;
  bucketName?: string;
};

/**
 * Creates a typed Minio operation for uploading a file to a bucket
 */
export function createUploadOperation(
  bucketName: string,
  objectName: string,
  file: File | Blob | ArrayBuffer | Buffer,
  metadata?: Record<string, string>
): MinioOperation<{ etag: string }> {
  return {
    operation: "uploadObject",
    bucketName,
    execute: async () => {
      try {
        // Convert File/Blob to Buffer if needed
        let fileData: Buffer;

        if (file instanceof File || file instanceof Blob) {
          const arrayBuffer = await file.arrayBuffer();
          fileData = Buffer.from(arrayBuffer);
        } else if (file instanceof ArrayBuffer) {
          fileData = Buffer.from(file);
        } else {
          fileData = file; // Already a Buffer
        }

        // Use fPutObject for files
        // For simplicity, save the buffer to a temporary file and use fPutObject
        const tempFilePath = `/tmp/${objectName.replace(/\//g, "_")}`;
        fs.writeFileSync(tempFilePath, fileData);

        const result = await minioClient.fPutObject(
          bucketName,
          objectName,
          tempFilePath,
          metadata
        );
        // Clean up the temporary file
        fs.unlinkSync(tempFilePath);

        return { etag: result.etag || "unknown-etag" };
      } catch (error) {
        logger.error(
          `Failed to upload object ${objectName} to bucket ${bucketName}:`,
          error
        );
        throw error;
      }
    },
  };
}

/**
 * Creates a typed Minio operation for downloading a file from a bucket
 */
export function createDownloadOperation(
  bucketName: string,
  objectName: string
): MinioOperation<Blob> {
  return {
    operation: "getObject",
    bucketName,
    execute: async () => {
      try {
        const stream = await minioClient.getObject(bucketName, objectName);
        // Convert stream to Blob
        return streamToBlob(stream);
      } catch (error) {
        logger.error(
          `Failed to download object ${objectName} from bucket ${bucketName}:`,
          error
        );
        throw error;
      }
    },
  };
}

/**
 * Converts a Readable stream to a Blob
 */
async function streamToBlob(stream: Readable): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(new Blob(chunks)));
  });
}

/**
 * Creates a typed Minio operation for listing objects in a bucket
 */
export function createListObjectsOperation(
  bucketName: string,
  prefix: string = "",
  recursive: boolean = true
): MinioOperation<
  { name: string; lastModified: Date; size: number; etag: string }[]
> {
  return {
    operation: "listObjects",
    bucketName,
    execute: async () => {
      try {
        const stream = await minioClient.listObjects(
          bucketName,
          prefix,
          recursive
        );

        // Convert stream to array
        return new Promise((resolve, reject) => {
          const objects: {
            name: string;
            lastModified: Date;
            size: number;
            etag: string;
          }[] = [];

          stream.on("data", (obj) => {
            // Only add objects that have all required properties
            if (
              obj.name &&
              obj.lastModified &&
              obj.size !== undefined &&
              obj.etag
            ) {
              objects.push({
                name: obj.name,
                lastModified: obj.lastModified,
                size: obj.size,
                etag: obj.etag,
              });
            }
          });

          stream.on("end", () => resolve(objects));
          stream.on("error", (err) => {
            logger.error(
              `Failed to list objects in bucket ${bucketName}:`,
              err
            );
            reject(err);
          });
        });
      } catch (error) {
        logger.error(`Failed to list objects in bucket ${bucketName}:`, error);
        throw error;
      }
    },
  };
}

/**
 * Creates a typed Minio operation for deleting an object from a bucket
 */
export function createDeleteOperation(
  bucketName: string,
  objectName: string
): MinioOperation<void> {
  return {
    operation: "removeObject",
    bucketName,
    execute: async () => {
      try {
        return await minioClient.removeObject(bucketName, objectName);
      } catch (error) {
        logger.error(
          `Failed to delete object ${objectName} from bucket ${bucketName}:`,
          error
        );
        throw error;
      }
    },
  };
}

/**
 * Creates a typed Minio operation for getting a presigned URL for an object
 */
export function createPresignedUrlOperation(
  bucketName: string,
  objectName: string,
  expirySeconds: number = 3600
): MinioOperation<string> {
  return {
    operation: "presignedGetObject",
    bucketName,
    execute: async () => {
      try {
        return await minioClient.presignedGetObject(
          bucketName,
          objectName,
          expirySeconds
        );
      } catch (error) {
        logger.error(
          `Failed to generate presigned URL for object ${objectName} in bucket ${bucketName}:`,
          error
        );
        throw error;
      }
    },
  };
}

/**
 * Creates a typed Minio operation for getting a presigned PUT URL for uploads
 */
export function createPresignedPutOperation(
  bucketName: string,
  objectName: string,
  expirySeconds: number = 3600,
  metadata?: Record<string, string>
): MinioOperation<string> {
  return {
    operation: "presignedPutObject",
    bucketName,
    execute: async () => {
      try {
        return await minioClient.presignedPutObject(
          bucketName,
          objectName,
          expirySeconds,
          metadata
        );
      } catch (error) {
        logger.error(
          `Failed to generate presigned PUT URL for object ${objectName} in bucket ${bucketName}:`,
          error
        );
        throw error;
      }
    },
  };
}

/**
 * Creates a typed Minio operation for getting object stats
 */
export function createStatObjectOperation(
  bucketName: string,
  objectName: string
): MinioOperation<{
  size: number;
  etag: string;
  lastModified: Date;
  metaData: Record<string, string>;
}> {
  return {
    operation: "statObject",
    bucketName,
    execute: async () => {
      try {
        return await minioClient.statObject(bucketName, objectName);
      } catch (error) {
        logger.error(
          `Failed to get stats for object ${objectName} in bucket ${bucketName}:`,
          error
        );
        throw error;
      }
    },
  };
}

/**
 * Ensures a bucket exists, creating it if necessary
 *
 * @param bucketName - The name of the bucket to check/create
 * @returns Promise resolving to true if bucket exists or was created
 */
export async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Created bucket: ${bucketName}`);
    }
    return true;
  } catch (error) {
    console.error(`Failed to ensure bucket ${bucketName} exists:`, error);
    throw error;
  }
}

/**
 * Executes a Minio operation with error handling
 */
export async function executeMinioOperation<T>(
  operation: MinioOperation<T>
): Promise<T> {
  try {
    // First ensure the bucket exists if this is a bucket operation
    if (operation.bucketName) {
      await ensureBucketExists(operation.bucketName);
    }
    return await operation.execute();
  } catch (error) {
    logger.error(`Minio operation '${operation.operation}' failed:`, error);
    throw error;
  }
}
