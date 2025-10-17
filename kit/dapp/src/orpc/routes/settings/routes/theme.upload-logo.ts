import { DEFAULT_BRANDING_BUCKET } from "@/components/theme/lib/reset";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { minioMiddleware } from "@/orpc/middlewares/services/minio.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { createPresignedUploadUrl } from "@settlemint/sdk-minio";
import { randomUUID } from "node:crypto";
import { ThemeLogoUploadSchema } from "./theme.upload-logo.schema";

const LOGO_BASE_PATH = "logos";

const sanitizeFileName = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase().replaceAll(/\s+/g, "-");
  return normalized.replaceAll(/[^a-z0-9._-]/g, "_");
};

const resolveObjectKey = (
  mode: "light" | "dark",
  fileName: string
): {
  objectKey: string;
  pathPrefix: string;
  sanitizedFileName: string;
} => {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const unique = randomUUID().slice(0, 8);
  const sanitized = sanitizeFileName(fileName);
  const pathPrefix = `${LOGO_BASE_PATH}/${mode}`;
  const finalizedName = `${timestamp}-${unique}-${sanitized}`;
  return {
    objectKey: `${pathPrefix}/${finalizedName}`,
    pathPrefix,
    sanitizedFileName: finalizedName,
  };
};

export const uploadLogo = authRouter.settings.theme.uploadLogo
  .use(
    offChainPermissionsMiddleware({
      requiredPermissions: { setting: ["upsert"] },
    })
  )
  .use(minioMiddleware)
  .handler(async ({ input, context }) => {
    const payload = ThemeLogoUploadSchema.parse(input);
    const { mode, fileName, contentType } = payload;
    const bucket = DEFAULT_BRANDING_BUCKET;
    const { objectKey, pathPrefix, sanitizedFileName } = resolveObjectKey(
      mode,
      fileName
    );

    const expirySeconds = 15 * 60;

    const uploadUrl = await createPresignedUploadUrl(
      context.minioClient,
      sanitizedFileName,
      pathPrefix,
      bucket,
      expirySeconds
    );

    const expiresAt = new Date(Date.now() + expirySeconds * 1000).toISOString();

    return {
      mode,
      bucket,
      objectKey,
      publicUrl: `/${bucket}/${objectKey}`,
      uploadUrl,
      method: "PUT" as const,
      headers: {
        "Content-Type": contentType,
      },
      expiresAt,
    };
  });
