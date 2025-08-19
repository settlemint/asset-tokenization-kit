import { createServerMinioClient } from "@settlemint/sdk-minio";

// Validate required environment variables
const minioEndpoint = process.env.SETTLEMINT_MINIO_ENDPOINT;
const minioAccessKey = process.env.SETTLEMINT_MINIO_ACCESS_KEY;
const minioSecretKey = process.env.SETTLEMINT_MINIO_SECRET_KEY;

if (!minioEndpoint) {
  throw new Error('SETTLEMINT_MINIO_ENDPOINT environment variable is required');
}

if (!minioAccessKey) {
  throw new Error('SETTLEMINT_MINIO_ACCESS_KEY environment variable is required');
}

if (!minioSecretKey) {
  throw new Error('SETTLEMINT_MINIO_SECRET_KEY environment variable is required');
}

export const { client } = createServerMinioClient({
  instance: minioEndpoint,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey
});