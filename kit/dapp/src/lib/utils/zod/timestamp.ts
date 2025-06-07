/**
 * Timestamp Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating and transforming timestamps
 * in various formats (ISO string, milliseconds, seconds, or Date objects). It's designed
 * to handle the complexity of timestamp formats commonly encountered in APIs, databases,
 * and blockchain applications.
 * 
 * @module TimestampValidation
 */
import { z } from "zod";

/**
 * Creates a Zod schema that validates and normalizes timestamps in various formats.
 *
 * @remarks
 * Features:
 * - Accepts ISO date strings (e.g., "2023-04-01T12:00:00Z")
 * - Accepts Unix timestamps in seconds or milliseconds
 * - Accepts JavaScript Date objects
 * - Handles string representations of numeric timestamps
 * - Automatically detects timestamp precision (seconds, milliseconds, microseconds, nanoseconds)
 * - Validates date ranges to prevent invalid dates (1970-9999)
 * - Normalizes all inputs to Date objects for consistency
 * 
 * Common timestamp formats:
 * - Unix seconds: 10 digits (e.g., 1680354000)
 * - Unix milliseconds: 13 digits (e.g., 1680354000000)
 * - Microseconds: 16 digits (converted to milliseconds)
 * - Nanoseconds: 19 digits (converted to milliseconds)
 * 
 * @returns A branded Zod schema that transforms various inputs to Date objects
 *
 * @example
 * ```typescript
 * const schema = timestamp();
 * 
 * // ISO string formats
 * schema.parse("2023-04-01T12:00:00Z");     // UTC time
 * schema.parse("2023-04-01T12:00:00+00:00"); // With timezone
 * 
 * // Unix timestamps
 * schema.parse(1680354000);     // Seconds (auto-detected)
 * schema.parse(1680354000000);  // Milliseconds
 * 
 * // String timestamps
 * schema.parse("1680354000");    // String seconds
 * schema.parse("1680354000000"); // String milliseconds
 * 
 * // Date objects
 * schema.parse(new Date());      // Pass-through
 * 
 * // Invalid inputs
 * schema.parse("invalid-date");  // Throws ZodError
 * schema.parse(-1000);          // Throws - negative timestamp
 * ```
 */
export const timestamp = () =>
  z
    .union([z.string(), z.number(), z.date()])
    .describe("A timestamp in various formats")
    .transform((value): Date => {
      // Handle Date objects
      if (value instanceof Date) {
        return value;
      }

      // Handle string inputs
      if (typeof value === "string") {
        // Check if it's a numeric string
        if (/^\d+$/.test(value)) {
          const num = Number(value);
          if (isNaN(num)) {
            throw new Error("Please enter a valid timestamp");
          }

          // Detect timestamp precision based on length
          // Unix seconds: 10 digits (covers years 1970-2286)
          if (value.length === 10) {
            return new Date(num * 1000);
          }
          // Milliseconds: 13 digits (covers years 1970-2286)
          else if (value.length === 13) {
            return new Date(num);
          }
          // Microseconds: 16 digits
          else if (value.length === 16) {
            return new Date(num / 1000);
          }
          // Nanoseconds: 19 digits
          else if (value.length === 19) {
            return new Date(num / 1000000);
          }
          // For other lengths, try to determine if seconds or milliseconds
          else if (num < 10000000000) {
            return new Date(num * 1000); // Likely seconds
          } else {
            return new Date(num); // Likely milliseconds or higher
          }
        }

        // Try parsing as ISO string or other date format
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          throw new Error("Please enter a valid date");
        }
        return date;
      }

      // Handle numeric inputs
      if (typeof value === "number") {
        // Check for valid range (JavaScript Date can safely handle dates up to year 275760)
        if (value < 0) {
          throw new Error("Please enter a positive timestamp");
        }

        // Detect if the number is in seconds or milliseconds
        // Timestamps before year 2001 in milliseconds would be < 10000000000
        if (value < 10000000000) {
          return new Date(value * 1000); // Convert seconds to milliseconds
        } else if (value >= 10000000000000) {
          return new Date(value / 1000); // Convert microseconds to milliseconds
        }
        return new Date(value); // Already in milliseconds
      }

      // This should never be reached due to the union type, but TypeScript needs it
      throw new Error(`Unexpected value type: ${typeof value}`);
    })
    .refine(
      (date) => {
        const time = date.getTime();
        // Check for valid date range
        // Min: January 1, 1970 (Unix epoch)
        // Max: December 31, 9999 (far future, but still representable)
        return time >= 0 && time <= 253402300799999;
      },
      {
        message: "Please enter a date between 1970 and 9999",
      }
    )
    .brand<"Timestamp">();

// Export types
/**
 * Type representing a validated and normalized timestamp.
 * Always resolves to a Date object regardless of input format.
 * Branded for additional type safety.
 */
export type Timestamp = z.infer<ReturnType<typeof timestamp>>;

/**
 * Type guard to check if a value is a valid timestamp.
 * 
 * @param value - The value to check
 * @returns `true` if the value can be parsed as a valid timestamp, `false` otherwise
 * 
 * @example
 * ```typescript
 * const input: unknown = "2023-04-01T12:00:00Z";
 * if (isTimestamp(input)) {
 *   // TypeScript knows input will parse to a valid Date
 *   console.log("Valid timestamp");
 * }
 * 
 * // Check various formats
 * isTimestamp(1680354000);      // true - Unix seconds
 * isTimestamp("1680354000000"); // true - String milliseconds
 * isTimestamp(new Date());      // true - Date object
 * isTimestamp("invalid");       // false
 * ```
 */
export function isTimestamp(value: unknown): value is Timestamp {
  try {
    return timestamp().safeParse(value).success;
  } catch {
    // Catch any unexpected errors during parsing
    return false;
  }
}

/**
 * Safely parse and return a timestamp or throw an error.
 * 
 * @param value - The value to parse as a timestamp
 * @returns The normalized Date object
 * @throws {Error} If the value cannot be parsed as a valid timestamp
 * 
 * @example
 * ```typescript
 * try {
 *   // Parse different formats to Date
 *   const date1 = getTimestamp("2023-04-01T12:00:00Z");
 *   const date2 = getTimestamp(1680354000);
 *   const date3 = getTimestamp("1680354000000");
 *   
 *   // All return Date objects
 *   console.log(date1.toISOString());
 * } catch (error) {
 *   console.error("Invalid timestamp format");
 * }
 * 
 * // Use in data processing
 * const createdAt = getTimestamp(apiResponse.created_at);
 * const expiresAt = getTimestamp(tokenData.exp);
 * ```
 */
export function getTimestamp(value: unknown): Timestamp {
  const result = timestamp().safeParse(value);
  if (!result.success) {
    throw new Error("Please enter a valid date or timestamp");
  }
  return result.data;
}
