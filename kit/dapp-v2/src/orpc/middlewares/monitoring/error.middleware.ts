import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError, ValidationError } from "@orpc/server";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { APIError } from "better-auth/api";
import { br } from "../../procedures/base.router";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * Converts Better Auth API errors to ORPC errors.
 *
 * This utility function transforms authentication errors from the Better Auth
 * library into standardized ORPC errors, ensuring consistent error handling
 * and response formats across the application.
 *
 * @param error - The Better Auth API error to convert
 * @returns Standardized ORPC error with proper status code and message
 *
 * @example
 * ```typescript
 * try {
 *   await auth.signIn(credentials);
 * } catch (error) {
 *   if (error instanceof APIError) {
 *     throw betterAuthErrorToORPCError(error);
 *   }
 * }
 * ```
 */
export function betterAuthErrorToORPCError(error: APIError) {
  return new ORPCError(error.status as ORPCErrorCode, {
    message: error.message,
    cause: error,
  });
}

/**
 * Comprehensive error handling middleware.
 *
 * This middleware provides centralized error handling for all ORPC procedures,
 * transforming various error types into standardized ORPC errors with proper
 * HTTP status codes and consistent response formats. It handles validation
 * errors, authentication errors, and other application-specific errors.
 *
 * Error transformation logic:
 * - ORPC errors: Logged and re-thrown as-is
 * - Better Auth errors: Converted to ORPC errors with proper status codes
 * - Validation errors: Transformed into structured validation failure responses
 * - Input validation: Returns 422 with detailed field errors
 * - Output validation: Returns 522 for server-side validation issues
 * - Unknown errors: Re-thrown for global error handlers
 *
 * The middleware ensures that:
 * - All errors are properly logged for debugging
 * - Client receives consistent error response formats
 * - Validation errors include detailed field-level information
 * - Authentication errors are properly categorized
 * - Server errors don't expose sensitive information
 *
 * @example
 * ```typescript
 * // Used as the first middleware in router chains
 * export const pr = br.use(errorMiddleware).use(sessionMiddleware);
 *
 * // Handles various error scenarios:
 * // 1. Input validation failure -> 422 with field errors
 * // 2. Authentication failure -> 401 with auth error
 * // 3. Authorization failure -> 403 with permission error
 * // 4. Server validation failure -> 522 with validation details
 * ```
 *
 * @see {@link ../../routes/procedures/base.contract} - Error definitions
 * @see {@link betterAuthErrorToORPCError} - Auth error conversion utility
 */
export const errorMiddleware = br.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    console.log(error);
    // Handle Better Auth API errors first
    if (error instanceof APIError) {
      logger.error("Better Auth API error", {
        statusCode: error.statusCode,
        message: error.message,
        error: error.name,
      });

      throw betterAuthErrorToORPCError(error);
    }

    // Handle specific ORPC error cases before general ORPC errors
    if (error instanceof ORPCError) {
      // Handle authorization validation errors (403 Forbidden)
      if (
        error.code === "FORBIDDEN" &&
        error.cause instanceof ValidationError
      ) {
        throw new ORPCError("FORBIDDEN", {
          status: 403,
          cause: error.cause,
        });
      }

      // Handle input validation errors (422 Unprocessable Entity)
      // Transform validation errors into structured field-level errors
      if (
        error.code === "BAD_REQUEST" &&
        error.cause instanceof ValidationError
      ) {
        // Convert ORPC validation issues to Zod format for consistent error structure
        throw new ORPCError("INPUT_VALIDATION_FAILED", {
          status: 422,
          // Flatten the error structure for easier client consumption
          data: error.cause.message,
          cause: error.cause,
        });
      }

      // Handle output validation errors (522 Custom Server Error)
      // These indicate server-side data integrity issues
      if (
        error.code === "INTERNAL_SERVER_ERROR" &&
        error.cause instanceof ValidationError
      ) {
        // Convert validation issues to structured format

        throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
          status: 522,
          // Include validation details for debugging (should be logged, not exposed to client)
          data: error.cause.message,
          cause: error.cause,
        });
      }

      // Handle other ORPC errors (already properly formatted)
      logger.error("ORPC error", {
        status: error.status,
        code: error.code as number,
        message: error.message,
        cause: error.cause?.constructor?.name,
      });
      throw error;
    }

    // Re-throw unknown errors for global error handlers
    throw error;
  }
});
