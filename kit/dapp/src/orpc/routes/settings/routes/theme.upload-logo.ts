import { DEFAULT_BUCKET } from "@/components/theme/lib/reset";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { minioMiddleware } from "@/orpc/middlewares/services/minio.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { env } from "@atk/config/env";
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
    const bucket = DEFAULT_BUCKET;
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

    const normalizedUploadUrl = (() => {
      if (env.SETTLEMINT_INSTANCE === "local") {
        try {
          const url = new URL(uploadUrl);
          if (
            (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
            url.protocol === "https:"
          ) {
            url.protocol = "http:";
            return url.toString();
          }
        } catch {
          return uploadUrl;
        }
      }
      return uploadUrl;
    })();

    const expiresAt = new Date(Date.now() + expirySeconds * 1000).toISOString();

    return {
      mode,
      bucket,
      objectKey,
      publicUrl: `/${bucket}/${objectKey}`,
      uploadUrl: normalizedUploadUrl,
      method: "PUT" as const,
      headers: {
        "Content-Type": contentType,
      },
      expiresAt,
    };
  });
