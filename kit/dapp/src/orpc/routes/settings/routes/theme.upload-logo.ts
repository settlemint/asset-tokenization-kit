import {
  DEFAULT_BRANDING_BUCKET,
  extractObjectKey,
} from "@/components/theme/lib/reset";
import { authRouter } from "@/orpc/procedures/auth.router";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { minioMiddleware } from "@/orpc/middlewares/services/minio.middleware";
import { deleteFile, uploadFile } from "@settlemint/sdk-minio";
import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

const LOGO_BASE_PATH = "logos";

const sanitizeFileName = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase().replaceAll(/\s+/g, "-");
  return normalized.replaceAll(/[^a-z0-9._-]/g, "_");
};

const resolveObjectKey = (mode: "light" | "dark", fileName: string): string => {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const unique = randomUUID().slice(0, 8);
  const sanitized = sanitizeFileName(fileName);
  return `${LOGO_BASE_PATH}/${mode}/${timestamp}-${unique}-${sanitized}`;
};

export const uploadLogo = authRouter.settings.theme.uploadLogo
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["upsert"] },
    })
  )
  .use(minioMiddleware)
  .handler(async ({ input, context }) => {
    const { mode, fileName, contentType, base64Data, fileSize, previousUrl } =
      input;
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length !== fileSize) {
      throw new Error("Uploaded file size mismatch");
    }

    const bucket = DEFAULT_BRANDING_BUCKET;
    const objectKey = resolveObjectKey(mode, fileName);

    const metadata = await uploadFile(
      context.minioClient,
      buffer,
      objectKey,
      contentType,
      bucket
    );

    if (previousUrl) {
      const previousKey = extractObjectKey(previousUrl, bucket);
      if (previousKey && previousKey !== objectKey) {
        await deleteFile(context.minioClient, previousKey, bucket).catch(() => {
          // Ignore cleanup failures to avoid blocking upload success
        });
      }
    }

    return {
      mode,
      bucket,
      objectKey,
      publicUrl: `/${bucket}/${objectKey}`,
      etag: metadata.etag,
      updatedAt: metadata.uploadedAt,
    };
  });
