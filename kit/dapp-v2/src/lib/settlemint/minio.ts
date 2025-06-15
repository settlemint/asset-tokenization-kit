import { createServerMinioClient } from "@settlemint/sdk-minio";

export const { client } = createServerMinioClient({
  instance: process.env.SETTLEMINT_MINIO_ENDPOINT!,
  accessKey: process.env.SETTLEMINT_MINIO_ACCESS_KEY!,
  secretKey: process.env.SETTLEMINT_MINIO_SECRET_KEY!
});