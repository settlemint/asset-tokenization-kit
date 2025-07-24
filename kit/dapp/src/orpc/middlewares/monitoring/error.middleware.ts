import type { ORPCErrorCode } from "@orpc/client";
import { ORPCError, ValidationError } from "@orpc/server";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { baseRouter } from "../../procedures/base.router";

const logger = createLogger();

/**
 * Formatted validation error structure
 */
interface FormattedValidationError {
  message: string;
  errors: {
    path: string;
    message: string;
    code?: string;
    expected?: unknown;
    received?: unknown;
  }[];
  errorCount: number;
}

/**
 * ORPC validation issue structure
 */
interface ORPCValidationIssue {
  path?: string;
  message?: string;
  expected?: unknown;
  received?: unknown;
}

/**
 * Formats Zod validation errors using Zod's built-in pretty printing.
 * @param zodError
 */
function formatZodError(zodError: z.ZodError): FormattedValidationError {
  const formattedErrors = zodError.issues.map((err) => ({
    path: err.path.join("."),
    message: err.message,
    code: err.code,
    expected: "expected" in err ? err.expected : undefined,
    received: "received" in err ? err.received : undefined,
  }));

  return {
    message: z.prettifyError(zodError),
    errors: formattedErrors,
    errorCount: formattedErrors.length,
  };
}

/**
 * Formats ORPC validation issues into a consistent structure.
 * @param issues
 */
function formatORPCValidationIssues(
  issues: ORPCValidationIssue[]
): FormattedValidationError {
  const formattedErrors = issues.map((issue) => ({
    path: issue.path ?? "unknown",
    message: issue.message ?? "Validation failed",
    expected: issue.expected,
    received: issue.received,
  }));

  return {
    message: `Output validation failed:\n${formattedErrors.map((i) => `- ${i.path}: ${i.message}`).join("\n")}`,
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
 * @param error - The Better Auth API error to convert
 * @returns Standardized ORPC error with proper status code and message
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
 * Gets formatted validation data from a ValidationError.
 * @param validationError
 */
function getFormattedValidationData(
  validationError: ValidationError
): FormattedValidationError | string {
  // Check for ORPC validation issues
  if (Array.isArray(validationError.issues)) {
    return formatORPCValidationIssues(
      validationError.issues as ORPCValidationIssue[]
    );
  }

  // Check for Zod errors
  if (validationError.cause instanceof z.ZodError) {
    return formatZodError(validationError.cause);
  }

  // Fallback to message
  return validationError.message;
}

/**
 * Logs validation errors with consistent format.
 * @param type
 * @param formattedData
 * @param validationError
 */
function logValidationError(
  type: string,
  formattedData: FormattedValidationError | string,
  validationError?: ValidationError
) {
  const logData: Record<string, unknown> = {
    message:
      typeof formattedData === "object" ? formattedData.message : formattedData,
    details: formattedData,
  };

  if (validationError?.cause instanceof z.ZodError) {
    logData.path = validationError.cause.issues[0]?.path;
  }

  if (validationError?.issues) {
    logData.issues = validationError.issues;
  }

  logger.error(type, logData);
}

/**
 * Comprehensive error handling middleware.
 *
 * This middleware provides centralized error handling for all ORPC procedures,
 * transforming various error types into standardized ORPC errors with proper
 * HTTP status codes and consistent response formats.
 *
 * Error transformation logic:
 * - Better Auth errors: Converted to ORPC errors with proper status codes
 * - ORPC validation errors: Transformed into structured failure responses
 * - Unknown errors: Wrapped in INTERNAL_SERVER_ERROR with details
 * @example
 * ```typescript
 * export const pr = baseRouter.use(errorMiddleware).use(sessionMiddleware);
 * ```
 */
export const errorMiddleware = baseRouter.middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // Handle Better Auth API errors
    if (error instanceof APIError) {
      logger.error("Better Auth API error", {
        statusCode: error.statusCode,
        message: error.message,
        error: error.name,
      });
      throw betterAuthErrorToORPCError(error);
    }

    // Handle ORPC errors with validation causes
    if (error instanceof ORPCError && error.cause instanceof ValidationError) {
      const validationError = error.cause;

      // Authorization validation errors (403)
      if (error.code === "FORBIDDEN") {
        throw new ORPCError("FORBIDDEN", {
          status: 403,
          cause: validationError,
        });
      }

      // Input validation errors (422)
      if (error.code === "BAD_REQUEST") {
        const formattedData = getFormattedValidationData(validationError);
        logValidationError(
          "Input validation failed",
          formattedData,
          validationError
        );

        throw new ORPCError("INPUT_VALIDATION_FAILED", {
          status: 422,
          data: formattedData,
          cause: validationError,
        });
      }

      // Output validation errors (522)
      if (error.code === "INTERNAL_SERVER_ERROR") {
        const formattedData = getFormattedValidationData(validationError);
        logValidationError(
          "Output validation failed",
          formattedData,
          validationError
        );

        throw new ORPCError("OUTPUT_VALIDATION_FAILED", {
          status: 522,
          data: formattedData,
          cause: validationError,
        });
      }
    }

    // Handle other ORPC errors
    if (error instanceof ORPCError) {
      // Log the error for debugging with full context
      logger.error("ORPC error", {
        code: error.code as string,
        status: error.status,
        message:
          error.message || `Request failed with status ${String(error.code)}`,
        cause:
          error.cause instanceof Error
            ? error.cause.message
            : String(error.cause),
        stack: error.cause instanceof Error ? error.cause.stack : undefined,
        data: error.data as unknown,
      });

      // Ensure the error has a meaningful message
      if (!error.message || error.message.trim() === "") {
        throw new ORPCError(error.code, {
          status: error.status,
          message: `Request failed with status ${String(error.code)}`,
          cause: error.cause ?? error,
          data: error.data,
        });
      }

      throw error;
    }

    // Wrap all other errors in INTERNAL_SERVER_ERROR
    logger.error("Unexpected error in ORPC middleware", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined,
    });

    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      status: 500,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
      cause: error,
    });
  }
});
