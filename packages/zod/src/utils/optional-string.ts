import { z } from "zod";

/**
 * Makes a string-based validator optional, accepting empty strings, null, and undefined.
 * This is useful for form fields where:
 * - Clearing the input sends an empty string
 * - The field might be null/undefined when not provided
 *
 * @example
 * optionalString(z.string().min(8).max(100))
 * optionalString(isin())
 * optionalString(ethereumAddress())
 */
export function optionalString<T extends z.ZodType>(validator: T) {
  return validator.or(z.literal("")).nullish();
}
