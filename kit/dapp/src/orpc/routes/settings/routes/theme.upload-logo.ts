import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { minioMiddleware } from "@/orpc/middlewares/services/minio.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { env } from "@atk/config/env";
import { createPresignedUploadUrl } from "@settlemint/sdk-minio";
import { randomUUID } from "node:crypto";
import {
  ThemeLogoUploadSchema,
  type ThemeLogoMode,
} from "./theme.upload-logo.schema";

const LOGO_BASE_PATH = "logos";
const AUTH_BASE_PATH = "auth";
const BACKGROUND_BASE_PATH = "backgrounds";
const FAVICON_BASE_PATH = "favicons";
const ICONS_BASE_PATH = "icons";

const MODE_PATHS: Record<ThemeLogoMode, string> = {
  light: `${LOGO_BASE_PATH}/light`,
  dark: `${LOGO_BASE_PATH}/dark`,
  lightIcon: `${LOGO_BASE_PATH}/light-icon`,
  darkIcon: `${LOGO_BASE_PATH}/dark-icon`,
  authLight: `${AUTH_BASE_PATH}/light`,
  authDark: `${AUTH_BASE_PATH}/dark`,
  backgroundLight: `${BACKGROUND_BASE_PATH}/light`,
  backgroundDark: `${BACKGROUND_BASE_PATH}/dark`,
  favicon: FAVICON_BASE_PATH,
  appleTouchIcon: `${ICONS_BASE_PATH}/apple-touch`,
  favicon96: `${ICONS_BASE_PATH}/favicon-96`,
  faviconSvg: `${ICONS_BASE_PATH}/favicon-svg`,
};

const sanitizeFileName = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase().replaceAll(/\s+/g, "-");
  return normalized.replaceAll(/[^a-z0-9._-]/g, "_");
};

const resolveObjectKey = (
  mode: ThemeLogoMode,
  fileName: string
): {
  objectKey: string;
  pathPrefix: string;
  sanitizedFileName: string;
} => {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const unique = randomUUID().slice(0, 8);
  const sanitized = sanitizeFileName(fileName);
  const pathPrefix = MODE_PATHS[mode];
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
    const bucket = env.SETTLEMINT_MINIO_BUCKET;
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
      try {
        const url = new URL(uploadUrl);
        if (
          env.SETTLEMINT_INSTANCE === "local" &&
          (url.hostname === "localhost" || url.hostname === "127.0.0.1")
        ) {
          url.protocol = "http:";
        }
        return url.toString();
      } catch {
        return uploadUrl;
      }
    })();

    // Generate a stable, non-expiring public URL for the asset
    // Use the standard /{bucket}/{objectKey} path format
    const publicUrl = `/${bucket}/${objectKey}`;

    const expiresAt = new Date(Date.now() + expirySeconds * 1000).toISOString();

    return {
      mode,
      bucket,
      objectKey,
      publicUrl,
      uploadUrl: normalizedUploadUrl,
      method: "PUT" as const,
      headers: {
        "Content-Type": contentType,
      },
      expiresAt,
    };
  });
