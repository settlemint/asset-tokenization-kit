/**
 * Formats validation errors for display in the UI
 */

import type { ORPCError } from "@orpc/client";

interface FormattedValidationError {
  path: string;
  message: string;
  code?: string;
  expected?: unknown;
  received?: unknown;
}

interface ValidationErrorData {
  message: string;
  errors: FormattedValidationError[];
  errorCount: number;
}

/**
 * Checks if an error is a validation error with structured data
 */
export function isValidationError(error: unknown): error is ORPCError & {
  data: ValidationErrorData;
} {
  return (
    error instanceof Error &&
    "code" in error &&
    (error.code === "INPUT_VALIDATION_FAILED" ||
      error.code === "OUTPUT_VALIDATION_FAILED") &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "errors" in error.data &&
    Array.isArray(error.data.errors)
  );
}

/**
 * Formats a validation error into a user-friendly message
 *
 * @param error - The error to format
 * @returns A formatted error message
 */
export function formatValidationError(error: unknown): string {
  if (!isValidationError(error)) {
    if (error instanceof Error) {
      return error.message;
    }
    return "An unknown error occurred";
  }

  // If we have a pretty-printed message from Zod, use it directly
  if (
    typeof error.data === "object" &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  // Fallback to structured error formatting
  const { errors, errorCount } = error.data;

  if (errorCount === 1) {
    const firstError = errors[0];
    return firstError.path
      ? `${firstError.path}: ${firstError.message}`
      : firstError.message;
  }

  // Multiple errors - format as a list
  const errorMessages = errors.map((err) =>
    err.path ? `• ${err.path}: ${err.message}` : `• ${err.message}`
  );

  return `Validation failed with ${errorCount} errors:\n${errorMessages.join("\n")}`;
}

/**
 * Gets field-specific errors from a validation error
 * Useful for form field error display
 *
 * @param error - The validation error
 * @returns A map of field paths to error messages
 */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (!isValidationError(error)) {
    return {};
  }

  const fieldErrors: Record<string, string> = {};

  for (const err of error.data.errors) {
    if (err.path) {
      fieldErrors[err.path] = err.message;
    }
  }

  return fieldErrors;
}
