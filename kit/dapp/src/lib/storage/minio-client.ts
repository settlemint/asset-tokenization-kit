import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import fs from "fs";
import { Client } from "minio";
import "server-only";
import { Readable } from "stream";

// Use fs.promises for non-blocking operations
const fsPromises = fs.promises;

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

// Default values
const DEFAULT_REGION = "us-east-1";
const DEFAULT_PORT = 443;
const DEFAULT_USE_SSL = true;
const DEFAULT_BUCKET = "assets";

// Simple in-memory cache for the MinIO client
let cachedClient: Client | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION_MS = 3600 * 1000; // 1 hour in milliseconds

/**
 * Parses the MinIO endpoint URL from the environment variable
 * @returns The parsed endpoint details
 */
function parseEndpoint() {
  const endpoint = process.env.SETTLEMINT_MINIO_ENDPOINT || "";
  const endpointUrlMatch = endpoint.match(/^s3:\/\/(.+?)(\/.*)?$/);

  if (!endpointUrlMatch) {
    throw new Error(
      "Invalid MinIO endpoint format. Expected format: s3://host[:port][/path]"
    );
  }

  const hostWithPort = endpointUrlMatch[1];
  const [host, portStr] = hostWithPort.split(":");
  const port = portStr ? parseInt(portStr, 10) : DEFAULT_PORT;

  return { host, port };
}

/**
 * Creates a MinIO client instance using environment variables
 * @returns A configured MinIO client
 */
export async function createMinioClient(): Promise<Client> {
  try {
    // Check if we have a valid cached client instance
    const now = Date.now();
    if (cachedClient && now < cacheExpiry) {
      return cachedClient;
    }

    // Parse the endpoint
    const { host, port } = parseEndpoint();

    // Get credentials from environment variables
    const accessKey = process.env.SETTLEMINT_MINIO_ACCESS_KEY || "";
    const secretKey = process.env.SETTLEMINT_MINIO_SECRET_KEY || "";

    if (!accessKey || !secretKey) {
      throw new Error("MinIO credentials not found in environment variables");
    }

    // Create the client
    const client = new Client({
      endPoint: host,
      port,
      useSSL: DEFAULT_USE_SSL,
      accessKey,
      secretKey,
      region: DEFAULT_REGION,
    });

    // Cache the client instance
    cachedClient = client;
    cacheExpiry = now + CACHE_DURATION_MS;

    return client;
  } catch (error) {
    console.error("Error creating MinIO client:", error);
    throw new Error("Failed to create MinIO client");
  }
}

// Default bucket name for application files
export const DEFAULT_BUCKET_APP =
  process.env.MINIO_DEFAULT_BUCKET || "asset-tokenization";

// Types for Minio operations
export type UploadedObjectInfo = {
  etag: string;
  versionId?: string | null;
};

export type ItemMetadata = Record<string, string>;

export type SimpleUploadOperation = (
  file: File,
  bucketName: string,
  objectName: string,
  metadata?: ItemMetadata
) => Promise<UploadedObjectInfo>;

/**
 * Extended client type with additional methods
 */
export type ExtendedMinioClient = Client & {
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

/**
 * Get a cached instance of the MinIO client
 */
export async function getMinioClient(): Promise<ExtendedMinioClient> {
  const client = await createMinioClient();
  return client as ExtendedMinioClient;
}

/**
 * Operation type for Minio operations
 */
export type MinioOperation<T = unknown> = {
  operation: string;
  execute: () => Promise<T>;
  bucketName?: string;
};

/**
 * Ensures that the specified bucket exists, creating it if necessary
 * @param bucketName Name of the bucket to ensure exists
 * @returns True if the bucket exists or was created
 */
export async function ensureBucketExists(
  bucketName: string = DEFAULT_BUCKET
): Promise<boolean> {
  try {
    const client = await createMinioClient();
    const exists = await client.bucketExists(bucketName);

    if (!exists) {
      await client.makeBucket(bucketName, DEFAULT_REGION);
      console.log(`Created bucket: ${bucketName}`);
    }

    return true;
  } catch (error) {
    console.error(`Error ensuring bucket exists: ${bucketName}`, error);
    return false;
  }
}

/**
 * Uploads a file to a bucket. If the bucket does not exist, it will be created.
 *
 * @param bucketName The name of the bucket
 * @param objectName The name of the object
 * @param file The file to upload
 * @param metadata Optional metadata for the file
 * @returns The ETag of the uploaded file
 */
export async function uploadFile(
  bucketName: string,
  objectName: string,
  file: File | Blob | ArrayBuffer | Buffer,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    await ensureBucketExists(bucketName);

    const uploadOperation = createUploadOperation(
      bucketName,
      objectName,
      file,
      metadata
    );

    const result = await uploadOperation.execute();
    return result.etag;
  } catch (error) {
    console.error(
      `Failed to upload file ${objectName} to bucket ${bucketName}:`,
      error
    );
    throw error;
  }
}

/**
 * Generates a presigned URL for object access
 * @param bucketName Name of the bucket containing the object
 * @param objectName Name of the object to generate URL for
 * @param expirySeconds Number of seconds until the URL expires
 * @returns The presigned URL
 */
export async function generatePresignedUrl(
  bucketName: string = DEFAULT_BUCKET,
  objectName: string,
  expirySeconds: number = 3600
): Promise<string> {
  try {
    const client = await createMinioClient();
    return await client.presignedGetObject(
      bucketName,
      objectName,
      expirySeconds
    );
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw new Error("Failed to generate presigned URL");
  }
}

/**
 * Lists objects in a bucket with a given prefix
 * @param prefix Prefix to filter objects by
 * @param bucketName Name of the bucket to list objects from
 * @returns Array of object information
 */
export async function listObjects(
  prefix: string = "",
  bucketName: string = DEFAULT_BUCKET
) {
  try {
    const client = await createMinioClient();
    const objectsStream = client.listObjects(bucketName, prefix, true);

    return new Promise((resolve, reject) => {
      const objects: any[] = [];

      objectsStream.on("data", (obj) => {
        objects.push(obj);
      });

      objectsStream.on("error", (err) => {
        reject(err);
      });

      objectsStream.on("end", () => {
        resolve(objects);
      });
    });
  } catch (error) {
    console.error("Error listing objects:", error);
    throw new Error("Failed to list objects from MinIO");
  }
}

/**
 * Deletes an object from a bucket
 * @param objectName Name of the object to delete
 * @param bucketName Name of the bucket containing the object
 * @returns True if deletion was successful
 */
export async function deleteObject(
  objectName: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<boolean> {
  try {
    const client = await createMinioClient();
    await client.removeObject(bucketName, objectName);
    return true;
  } catch (error) {
    console.error("Error deleting object:", error);
    return false;
  }
}

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
        const minioClient = await getMinioClient();

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

        // Use putObject directly with buffer data
        console.log(`Uploading object directly: ${bucketName}/${objectName}`);
        const result = await minioClient.putObject(
          bucketName,
          objectName,
          fileData,
          fileData.length,
          metadata
        );

        // Cast the result to UploadedObjectInfo type
        const uploadResult = result as UploadedObjectInfo;

        console.log(
          `Upload successful for ${objectName}, ETag: ${uploadResult.etag}`
        );

        return { etag: uploadResult.etag };
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
 * Creates an operation to upload a file directly to MinIO (browser/client-side)
 */
export function createSimpleUploadOperation(
  minioClient: ExtendedMinioClient
): SimpleUploadOperation {
  return async (
    file: File,
    bucketName: string,
    objectName: string,
    metadata?: ItemMetadata
  ) => {
    try {
      logger.debug(
        `Starting upload for file ${file.name} (${file.size} bytes, type: ${file.type}) to ${bucketName}/${objectName}`
      );

      // Convert File to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      logger.debug(
        `File converted to buffer (${buffer.length} bytes), attempting putObject operation`
      );

      // Upload directly using minioClient's putObject
      const result = await minioClient.putObject(
        bucketName,
        objectName,
        buffer,
        buffer.length,
        metadata
      );

      logger.debug(
        `Upload successful for ${file.name} to ${bucketName}/${objectName}, etag: ${result.etag}`
      );
      return result;
    } catch (error) {
      logger.error(
        `Error uploading file ${file.name} (${file.size} bytes, type: ${file.type}) to ${bucketName}/${objectName}`,
        error
      );
      throw error;
    }
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
        const minioClient = await getMinioClient();
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
        const minioClient = await getMinioClient();
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
        const minioClient = await getMinioClient();
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
        const minioClient = await getMinioClient();
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
        const minioClient = await getMinioClient();
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
        const minioClient = await getMinioClient();
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
 * Executes a Minio operation with error handling
 */
export async function executeMinioOperation<T>(
  operation: MinioOperation<T>
): Promise<T> {
  console.log(`Executing Minio operation: ${operation.operation}`);
  try {
    // First ensure the bucket exists if this is a bucket operation
    if (operation.bucketName) {
      console.log(
        `Ensuring bucket '${operation.bucketName}' exists before operation.`
      );
      await ensureBucketExists(operation.bucketName);
      console.log(
        `Bucket '${operation.bucketName}' confirmed or created. Proceeding with operation.`
      );
    }
    console.log(`Calling operation.execute() for ${operation.operation}...`);
    const result = await operation.execute();
    console.log(
      `Minio operation '${operation.operation}' completed successfully.`
    );
    return result;
  } catch (error) {
    logger.error(`Minio operation '${operation.operation}' failed:`, error);
    throw error; // Re-throw the error to be caught by the calling function
  }
}
