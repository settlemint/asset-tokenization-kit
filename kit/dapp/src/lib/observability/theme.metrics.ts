import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";

type ThemeReadOutcome = "db-hit" | "fallback-empty" | "fallback-invalid";

type ThemeReadMetric = {
  durationMs: number;
  outcome: ThemeReadOutcome;
  rowCount: number;
};

type ThemeUpdateMetric = {
  durationMs: number;
  success: boolean;
};

type ThemePreviewMetric = {
  action: "set" | "get" | "clear";
  durationMs: number;
  hit?: boolean;
  expired?: boolean;
  keyLength: number;
  ttlMs?: number;
  ttlRemainingMs?: number;
};

const metricsLogger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel | undefined) ?? "info",
});

function now(): number {
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return performance.now();
  }
  return Date.now();
}

function log(event: string, payload: Record<string, unknown>): void {
  metricsLogger.debug(`theme.${event}`, payload);
}

export function startThemeMetricTimer(): () => number {
  const start = now();
  return () => {
    const duration = now() - start;
    return Math.max(duration, 0);
  };
}

export function recordThemeReadMetric(payload: ThemeReadMetric): void {
  log("read", payload);
}

export function recordThemeUpdateMetric(payload: ThemeUpdateMetric): void {
  log("update", payload);
}

export function recordThemePreviewMetric(payload: ThemePreviewMetric): void {
  log("preview", payload);
}
