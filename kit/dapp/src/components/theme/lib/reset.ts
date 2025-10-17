import { env } from "@atk/config/env";
import { client as defaultMinioClient } from "@/lib/settlemint/minio";
import { deleteFile } from "@settlemint/sdk-minio";
import { compileThemeCSS } from "./compile-css";
import { DEFAULT_THEME, type ThemeConfig } from "./schema";
import { getTheme, resetTheme as deleteThemeRow } from "./repository";

export const DEFAULT_BUCKET = env.SETTLEMINT_MINIO_BUCKET;

interface ResetThemeOptions {
  minioClient?: Parameters<typeof deleteFile>[0];
  bucket?: string;
}

interface ThemeResetResult {
  theme: ThemeConfig;
  css: string;
  removedObjects: string[];
}

export async function resetThemeToDefaults(
  options: ResetThemeOptions = {}
): Promise<ThemeResetResult> {
  const currentTheme = await getTheme();
  const minioClient = options.minioClient ?? defaultMinioClient;
  const bucket = options.bucket ?? DEFAULT_BUCKET;

  const removedObjects: string[] = [];

  const logoKeys = new Set<string>();
  for (const url of [currentTheme.logo.lightUrl, currentTheme.logo.darkUrl]) {
    if (!url) continue;
    const key = extractObjectKey(url, bucket);
    if (key) {
      logoKeys.add(key);
    }
  }

  for (const key of logoKeys) {
    await deleteFile(minioClient, key, bucket);
    removedObjects.push(key);
  }

  await deleteThemeRow();

  const theme = DEFAULT_THEME;
  return {
    theme,
    css: compileThemeCSS(theme),
    removedObjects,
  };
}

export function extractObjectKey(url: string, bucket: string): string | null {
  const normalizedBucket = bucket.replaceAll(/^\/+|\/+$/g, "");

  const attempt = (value: string): string | null => {
    const cleaned = value.replace(/^\/+/, "");
    if (cleaned.startsWith(`${normalizedBucket}/`)) {
      return cleaned.slice(normalizedBucket.length + 1);
    }
    return null;
  };

  try {
    const parsed = new URL(url);
    const candidate = attempt(parsed.pathname);
    if (candidate) {
      return candidate;
    }
  } catch {
    // Fall back to relative parsing
  }

  return attempt(url);
}
