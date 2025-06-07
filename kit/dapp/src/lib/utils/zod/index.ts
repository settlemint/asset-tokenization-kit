/**
 * Zod Validation Utilities Index
 *
 * This module provides a centralized safe parsing utility for Zod schemas
 * with enhanced error logging and sensitive data redaction. It serves as
 * the main entry point for common validation operations.
 *
 * @module ZodUtilities
 */
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { redactSensitiveFields } from "../redaction";

// Create logger instance with configurable log level
const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * Safe parse function that provides detailed error logging with pretty printing.
 *
 * @remarks
 * This function enhances Zod's safeParse with:
 * - Automatic error logging with structured output
 * - Sensitive field redaction to prevent credential leaks
 * - Human-readable error messages via zod-validation-error
 * - Consistent error handling across the application
 *
 * Unlike direct schema.parse() which throws ZodError, this function
 * throws a generic Error with a safe message while logging details.
 *
 * @template T - The Zod schema type
 * @param schema - The Zod schema to validate against
 * @param value - The value to validate
 * @param options - Optional configuration for error formatting
 * @param options.errorFormatter - Custom error formatter function
 * @returns The parsed and validated data matching the schema type
 * @throws {Error} If validation fails (with details logged)
 *
 * @example
 * ```typescript
 * import { safeParse } from './zod';
 * import { ethereumAddress } from './zod/ethereum-address';
 *
 * try {
 *   // Parse with automatic error handling
 *   const address = safeParse(ethereumAddress(), userInput);
 *   console.log(`Valid address: ${address}`);\n * } catch (error) {
 *   // Error details are logged, safe message is thrown
 *   console.error(error.message); // "Validation failed with error(s). Check logs for details."
 * }
 *
 * // With custom error formatter
 * const result = safeParse(mySchema, data, {
 *   errorFormatter: (error) => `Custom: ${error.issues[0].message}`
 * });
 * ```
 */
export function safeParse<T extends z.ZodType>(
  schema: T,
  value: unknown,
  options?: {
    /**
     * Custom error formatter to override default formatting
     */
    errorFormatter?: (error: z.ZodError) => string;
  }
): z.infer<T> {
  // Attempt to parse the value with the provided schema
  const result = schema.safeParse(value);

  if (!result.success) {
    // Log detailed error information with sensitive data redacted
    logger.error("Zod validation failed", {
      input: redactSensitiveFields(value), // Redact passwords, keys, etc.
      errors: fromError(result.error), // Human-readable error format
    });

    // Throw a generic error to avoid exposing sensitive validation details
    throw new Error(`Validation failed with error(s). Check logs for details.`);
  }

  return result.data;
}
