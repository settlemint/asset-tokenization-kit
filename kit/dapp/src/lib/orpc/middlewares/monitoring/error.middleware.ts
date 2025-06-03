import { br } from "@/lib/orpc/routes/procedures/base.router";
import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError, ValidationError } from "@orpc/server";
import { APIError } from "better-auth/api";
import { ZodError, type ZodIssue } from "zod";

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
    // Handle ORPC errors (already properly formatted)
    if (error instanceof ORPCError) {
      console.error(" ERROR", "ORPC", error.status, error.message);
      throw error;
    }

    // Handle Better Auth API errors
    if (error instanceof APIError) {
      console.error(" ERROR", "Auth", error.statusCode, error.message);
      throw betterAuthErrorToORPCError(error);
    }

    // Handle authorization validation errors (403 Forbidden)
    if (
      error instanceof ORPCError &&
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
      error instanceof ORPCError &&
      error.code === "BAD_REQUEST" &&
      error.cause instanceof ValidationError
    ) {
      // Convert ORPC validation issues to Zod format for consistent error structure
      const zodError = new ZodError(error.cause.issues as ZodIssue[]);

      throw new ORPCError("INPUT_VALIDATION_FAILED", {
        status: 422,
        // Flatten the error structure for easier client consumption
        data: zodError.flatten(),
        cause: error.cause,
      });
    }

    // Handle output validation errors (522 Custom Server Error)
    // These indicate server-side data integrity issues
    if (
      error instanceof ORPCError &&
      error.code === "INTERNAL_SERVER_ERROR" &&
      error.cause instanceof ValidationError
    ) {
      // Convert validation issues to structured format
      const zodError = new ZodError(error.cause.issues as ZodIssue[]);

      throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
        status: 522,
        // Include validation details for debugging (should be logged, not exposed to client)
        data: zodError.flatten(),
        cause: error.cause,
      });
    }

    // Re-throw unknown errors for global error handlers
    throw error;
  }
});
