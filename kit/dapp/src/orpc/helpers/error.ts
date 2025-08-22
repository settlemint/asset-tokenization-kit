/**
 * Shared Error Logging Helper for ORPC
 *
 * Provides centralized error logging for ORPC handlers with filtering for expected client errors.
 */

import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

/**
 * Logs unexpected errors while filtering out expected client-side errors (4xx status codes).
 * Skips logging for NOT_FOUND and UNAUTHORIZED errors to reduce noise.
 *
 * @param error - The error object to potentially log
 */
export function logUnexpectedError(error: unknown) {
  const e = error as {
    code?: string;
    status?: number;
    message?: string;
    data?: unknown;
    cause?: unknown;
    stack?: string;
    response?: unknown;
  };

  const status = typeof e?.status === "number" ? e.status : undefined;
  const code = typeof e?.code === "string" ? e.code : undefined;

  // Skip common/expected client-side errors
  if (
    (status && status < 500) /* 4xx */ ||
    code === "NOT_FOUND" ||
    code === "UNAUTHORIZED"
  ) {
    return;
  }

  logger.error(`ORPC error details:`, {
    message: e?.message,
    code: e?.code,
    status: e?.status,
    data: e?.data,
    cause: e?.cause,
    stack: e?.stack,
    response: e?.response,
  });
}
