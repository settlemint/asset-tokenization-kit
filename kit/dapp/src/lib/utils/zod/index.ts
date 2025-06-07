import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { redactSensitiveFields } from "../redaction";

// Create logger instance
const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

/**
 * Safe parse function that provides detailed error logging with pretty printing
 * @param schema The Zod schema to validate against
 * @param value The value to validate
 * @param options Optional configuration for error formatting
 * @returns The parsed result with success status
 */
export function safeParse<T extends z.ZodType>(
  schema: T,
  value: unknown,
  options?: {
    /**
     * Custom error formatter
     */
    errorFormatter?: (error: z.ZodError) => string;
  }
) {
  const result = schema.safeParse(value);

  if (!result.success) {
    logger.error("Zod validation failed", {
      input: redactSensitiveFields(value),
      errors: fromError(result.error),
    });

    throw new Error(`Validation failed with error(s). Check logs for details.`);
  }

  return result.data;
}
