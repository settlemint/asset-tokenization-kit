/**
 * Formats validation errors for display in the UI
 */

import type { ORPCError } from "@orpc/server";

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

type ValidationError = ORPCError<
  "INPUT_VALIDATION_FAILED" | "OUTPUT_VALIDATION_FAILED",
  ValidationErrorData
>;

/**
 * Checks if an error is a validation error with structured data
 * @param error
 */
export function isValidationError(error: unknown): error is ValidationError {
  if (!(error instanceof Error)) return false;

  const orpcError = error as ORPCError<string, unknown>;

  return (
    "code" in orpcError &&
    (orpcError.code === "INPUT_VALIDATION_FAILED" ||
      orpcError.code === "OUTPUT_VALIDATION_FAILED") &&
    "data" in orpcError &&
    typeof orpcError.data === "object" &&
    orpcError.data !== null &&
    "errors" in orpcError.data &&
    Array.isArray((orpcError.data as { errors?: unknown[] }).errors)
  );
}

/**
 * Formats a validation error into a user-friendly message
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
    if (!firstError) {
      return error.message;
    }
    return firstError.path
      ? `${firstError.path}: ${firstError.message}`
      : firstError.message;
  }

  // Multiple errors - format as a list
  const errorMessages = errors.map((err: FormattedValidationError) =>
    err.path ? `• ${err.path}: ${err.message}` : `• ${err.message}`
  );

  return `Validation failed with ${String(errorCount)} errors:\n${errorMessages.join("\n")}`;
}

/**
 * Gets field-specific errors from a validation error
 * Useful for form field error display
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
