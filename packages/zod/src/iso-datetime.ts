/**
 * ISO 8601 DateTime Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for ISO 8601 datetime strings,
 * ensuring they conform to the standard format (YYYY-MM-DDTHH:mm:ss.sssZ).
 * @module ISODateTimeValidation
 */
import { z } from "zod";

/**
 * Validates that a string is a valid ISO 8601 datetime
 */
function validateISODateTime(value: string): boolean {
  // ISO 8601 regex pattern
  // Matches formats like:
  // - 2024-01-15T10:30:00Z
  // - 2024-01-15T10:30:00.123Z
  // - 2024-01-15T10:30:00+00:00
  // - 2024-01-15T10:30:00.123+05:30
  const iso8601Regex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

  if (!iso8601Regex.test(value)) {
    return false;
  }

  // Also verify it can be parsed as a valid date
  try {
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Zod schema for validating ISO 8601 datetime strings
 *
 * This schema provides comprehensive validation for ISO datetime strings with the following features:
 * - Format validation using regex pattern
 * - Valid date/time verification
 * - Timezone support (Z or ±HH:mm)
 * - Millisecond precision support (optional)
 *
 * Accepted formats:
 * - 2024-01-15T10:30:00Z (UTC)
 * - 2024-01-15T10:30:00.123Z (UTC with milliseconds)
 * - 2024-01-15T10:30:00+05:30 (with timezone offset)
 * - 2024-01-15T10:30:00.123-08:00 (with milliseconds and offset)
 *
 * The validation process follows these steps:
 * 1. Validate format using regex pattern
 * 2. Verify date can be parsed
 * 3. Ensure date is not Invalid Date
 * 4. Return validated ISO datetime string
 * @example
 * ```typescript
 * // Valid datetime parsing
 * isoDateTime.parse("2024-01-15T10:30:00Z");
 * isoDateTime.parse("2024-01-15T10:30:00.123Z");
 * isoDateTime.parse("2024-01-15T10:30:00+05:30");
 *
 * // Safe parsing with error handling
 * const result = isoDateTime.safeParse("2024-13-45"); // Invalid date
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 *
 * // Type guard usage
 * if (isISODateTime(userInput)) {
 *   // TypeScript knows userInput is ISODateTime
 *   console.log(`Valid datetime: ${userInput}`);
 * }
 * ```
 * @throws {ZodError} When the input fails validation
 */
export const isoDateTime = z
  .string()
  .refine(validateISODateTime, {
    message:
      "Must be a valid ISO 8601 datetime (e.g., 2024-01-15T10:30:00Z or 2024-01-15T10:30:00.123+05:30)",
  })
  .describe("An ISO 8601 datetime string");

/**
 * Type representing a validated ISO 8601 datetime string
 */
export type ISODateTime = z.infer<typeof isoDateTime>;

/**
 * Type guard function to check if a value is a valid ISO datetime
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid ISO datetime, `false` otherwise
 * @example
 * ```typescript
 * if (isISODateTime(userInput)) {
 *   // TypeScript knows userInput is ISODateTime
 *   console.log(`Valid datetime: ${userInput}`);
 * }
 * ```
 */
export function isISODateTime(value: unknown): value is ISODateTime {
  return isoDateTime.safeParse(value).success;
}

/**
 * Parse and validate an ISO datetime with error throwing
 * @param value - The value to parse and validate
 * @returns The validated ISO datetime string
 * @throws {ZodError} When the input fails validation
 * @example
 * ```typescript
 * try {
 *   const datetime = getISODateTime("2024-01-15T10:30:00Z");
 *   console.log(`Valid datetime: ${datetime}`);
 * } catch (error) {
 *   console.error("Validation failed:", error.message);
 * }
 * ```
 */
export function getISODateTime(value: unknown): ISODateTime {
  return isoDateTime.parse(value);
}
