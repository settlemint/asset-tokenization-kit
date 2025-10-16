import type { ThemeConfig } from "./schema";
import { cloneThemeConfig } from "./schema";
import {
  recordThemePreviewMetric,
  startThemeMetricTimer,
} from "@/lib/observability/theme.metrics";

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
  const stopTimer = startThemeMetricTimer();
  const ttl = (ttlSeconds ?? DEFAULT_TTL_MS / 1000) * 1000;
  const expiresAt = Date.now() + ttl;
  previews.set(key, {
    theme: cloneThemeConfig(theme),
    expiresAt,
  });
  recordThemePreviewMetric({
    action: "set",
    durationMs: stopTimer(),
    keyLength: key.length,
    ttlMs: ttl,
  });
  return expiresAt;
}

export function getThemePreview(key: string): ThemeConfig | undefined {
  const stopTimer = startThemeMetricTimer();
  const entry = previews.get(key);
  if (!entry) {
    recordThemePreviewMetric({
      action: "get",
      durationMs: stopTimer(),
      keyLength: key.length,
      hit: false,
    });
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    previews.delete(key);
    recordThemePreviewMetric({
      action: "get",
      durationMs: stopTimer(),
      keyLength: key.length,
      hit: false,
      expired: true,
    });
    return undefined;
  }

  const remainingMs = entry.expiresAt - Date.now();
  recordThemePreviewMetric({
    action: "get",
    durationMs: stopTimer(),
    keyLength: key.length,
    hit: true,
    ttlRemainingMs: remainingMs,
  });

  return cloneThemeConfig(entry.theme);
}

export function clearThemePreview(key: string): void {
  const stopTimer = startThemeMetricTimer();
  const deleted = previews.delete(key);
  recordThemePreviewMetric({
    action: "clear",
    durationMs: stopTimer(),
    keyLength: key.length,
    hit: deleted,
  });
}
