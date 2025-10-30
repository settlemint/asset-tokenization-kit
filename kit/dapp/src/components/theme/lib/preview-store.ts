import type { ThemeConfig } from "./schema";
import { cloneThemeConfig } from "./schema";

// In-memory cache keyed by editor id for live theme previews.

const DEFAULT_TTL_MS = 60_000;

type PreviewEntry = {
  theme: ThemeConfig;
  expiresAt: number;
};

const previews = new Map<string, PreviewEntry>();

export function setThemePreview(
  key: string,
  theme: ThemeConfig,
  ttlSeconds?: number
): number {
  const ttl = (ttlSeconds ?? DEFAULT_TTL_MS / 1000) * 1000;
  const expiresAt = Date.now() + ttl;
  previews.set(key, {
    theme: cloneThemeConfig(theme),
    expiresAt,
  });
  return expiresAt;
}

export function getThemePreview(key: string): ThemeConfig | undefined {
  const entry = previews.get(key);
  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    previews.delete(key);
    return undefined;
  }

  return cloneThemeConfig(entry.theme);
}

export function clearThemePreview(key: string): void {
  previews.delete(key);
}
