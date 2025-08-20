/**
 * Shared Error Logging Helper for ORPC
 *
 * This helper provides comprehensive error logging for all ORPC error handling interceptors,
 */

import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

/**
 * Creates a shared error interceptor for ORPC handlers
 *
 * @param context - Optional context about where the interceptor is being used
 * @returns ORPC error interceptor
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
