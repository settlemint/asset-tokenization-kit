import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { randomUUID } from "node:crypto";
import {
  ThemeLogoUploadSchema,
  type ThemeLogoMode,
} from "./theme.upload-logo.schema";

const LOGO_BASE_PATH = "logos";
const MODE_PATHS: Record<ThemeLogoMode, string> = {
  light: `${LOGO_BASE_PATH}/light`,
  dark: `${LOGO_BASE_PATH}/dark`,
  lightIcon: `${LOGO_BASE_PATH}/light-icon`,
  darkIcon: `${LOGO_BASE_PATH}/dark-icon`,
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
  .handler(async ({ input }) => {
    const payload = ThemeLogoUploadSchema.parse(input);
    const { mode, fileName } = payload;
    const { objectKey, sanitizedFileName } = resolveObjectKey(mode, fileName);

    // Return the better-upload.com endpoint
    const uploadUrl = "/api/upload";
    const publicUrl = `/uploads/logos/${objectKey}`;

    return {
      mode,
      bucket: "local",
      objectKey,
      publicUrl,
      uploadUrl,
      method: "POST" as const,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  });
