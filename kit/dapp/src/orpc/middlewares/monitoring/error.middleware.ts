import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError, ValidationError } from "@orpc/server";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { APIError } from "better-auth/api";
import { ZodError } from "zod/v4";
import { baseRouter } from "../../procedures/base.router";

const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * Formats Zod validation errors using Zod's built-in pretty printing.
 *
 * @param zodError - The ZodError to format
 * @returns A formatted error object with pretty-printed message and structured errors
 */
function formatZodError(zodError: ZodError) {
  // Use Zod's built-in pretty printing for a nice formatted message
  const prettyMessage = zodError.toString();

  // Also provide structured errors for programmatic access
  const formattedErrors = zodError.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
    expected: "expected" in err ? err.expected : undefined,
    received: "received" in err ? err.received : undefined,
  }));

  return {
    message: prettyMessage,
    errors: formattedErrors,
    errorCount: formattedErrors.length,
  };
}

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
 * export const pr = baseRouter.use(errorMiddleware).use(sessionMiddleware);
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
export const errorMiddleware = baseRouter.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // logger.error("ORPC error", error);

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
        // Check if the underlying cause is a ZodError for better formatting
        const formattedData =
          error.cause.cause instanceof ZodError
            ? formatZodError(error.cause.cause)
            : error.cause.message;

        logger.error("Input validation failed", {
          message:
            typeof formattedData === "object"
              ? formattedData.message
              : formattedData,
          details: formattedData,
          path:
            error.cause.cause instanceof ZodError
              ? error.cause.cause.errors[0]?.path
              : undefined,
        });

        // Convert ORPC validation issues to Zod format for consistent error structure
        throw new ORPCError("INPUT_VALIDATION_FAILED", {
          status: 422,
          // Provide structured error data for easier client consumption
          data: formattedData,
          cause: error.cause,
        });
      }

      // Handle output validation errors (522 Custom Server Error)
      // These indicate server-side data integrity issues
      if (
        error.code === "INTERNAL_SERVER_ERROR" &&
        error.cause instanceof ValidationError
      ) {
        // Check if we have ORPC validation issues
        let formattedData;
        if (error.cause.issues && Array.isArray(error.cause.issues)) {
          // Format ORPC validation issues
          const issues = error.cause.issues.map((issue: any) => ({
            path: issue.path || "unknown",
            message: issue.message || "Validation failed",
            expected: issue.expected,
            received: issue.received,
          }));

          formattedData = {
            message: `Output validation failed:\n${issues.map((i: any) => `- ${i.path}: ${i.message}`).join("\n")}`,
            errors: issues,
            errorCount: issues.length,
          };
        } else if (error.cause.cause instanceof ZodError) {
          // Format Zod errors
          formattedData = formatZodError(error.cause.cause);
        } else {
          formattedData = error.cause.message;
        }

        logger.error("Output validation failed", {
          message:
            typeof formattedData === "object"
              ? formattedData.message
              : formattedData,
          details: formattedData,
          issues: error.cause.issues,
        });

        throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
          status: 522,
          // Include structured validation details for debugging
          data: formattedData,
          cause: error.cause,
        });
      }

      throw error;
    }

    // Re-throw unknown errors for global error handlers
    throw error;
  }
});
