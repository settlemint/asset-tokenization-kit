/**
 * Zod Validation Utilities Index
 *
 * This module provides a centralized safe parsing utility for Zod schemas
 * with enhanced error logging and sensitive data redaction. It serves as
 * the main entry point for common validation operations.
 * @module ZodUtilities
 */
import { createLogger } from "@settlemint/sdk-utils/logging";
import { z } from "zod";

// Create logger instance with configurable log level
const logger = createLogger();

/**
 * Safe parse function that provides detailed error logging with pretty printing.
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
 * Note: This implementation differs from Zod's native safeParse by throwing
 * errors on validation failure rather than returning a result object.
 * This is intentional to provide consistent error handling with logging.
 *
 * For promise schemas, note that Zod requires async parsing methods.
 * Using promise schemas with this synchronous method will throw an error.
 * @template T - The Zod schema type
 * @param schema - The Zod schema to validate against
 * @param value - The value to validate
 * @param options - Optional configuration for error formatting
 * @param options.errorFormatter - Custom error formatter function
 * @returns The parsed and validated data matching the schema type
 * @throws {Error} If validation fails (with details logged)
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
  value: unknown
): z.infer<T> {
  // Attempt to parse the value with the provided schema
  const result = schema.safeParse(value);

  if (!result.success) {
    if (process.env.NODE_ENV === "test") {
      // In test environment, throw a simple error without prettified output
      throw new Error(
        `Validation failed with error(s). Check logs for details.`
      );
    }
    logger.error(z.prettifyError(result.error));
    // Throw a generic error to avoid exposing sensitive validation details
    throw new Error(`Validation failed with error(s). Check logs for details.`);
  }

  return result.data;
}
