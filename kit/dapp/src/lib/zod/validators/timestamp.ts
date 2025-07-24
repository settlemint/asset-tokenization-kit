/**
 * Timestamp Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating and transforming timestamps
 * in various formats (ISO string, milliseconds, seconds, or Date objects). It's designed
 * to handle the complexity of timestamp formats commonly encountered in APIs, databases,
 * and blockchain applications.
 * @module TimestampValidation
 */
import type { StandardRPCCustomJsonSerializer } from "@orpc/client/standard";
import { z } from "zod";

/**
 * Creates a Zod schema that validates and normalizes timestamps in various formats.
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
 * - Blockchain timestamps: < 1000 (treated as seconds from genesis)
 * - Unix seconds: 10 digits (e.g., 1680354000)
 * - Unix milliseconds: 13 digits (e.g., 1680354000000)
 * - Microseconds: 16 digits (converted to milliseconds)
 * - Nanoseconds: 19 digits (converted to milliseconds)
 * @returns A Zod schema that transforms various inputs to Date objects
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
    .preprocess((value) => {
      // Handle Date objects - pass through
      if (value instanceof Date) {
        return value;
      }

      // Handle numeric strings that represent timestamps
      if (typeof value === "string" && /^\d+$/.test(value)) {
        const num = Number(value);
        // No need to check isNaN - a string of only digits always parses to a valid number

        // Detect timestamp precision based on length
        const len = value.length;
        if (len === 10) return new Date(num * 1000); // Unix seconds to milliseconds
        if (len === 13) return new Date(num); // Already milliseconds
        if (len === 16) return new Date(num / 1000); // Microseconds to milliseconds
        if (len === 19) return new Date(num / 1_000_000); // Nanoseconds to milliseconds
        // For other lengths, use heuristic
        return new Date(num < 10_000_000_000 ? num * 1000 : num);
      }

      // Handle any other string (ISO dates, etc)
      if (typeof value === "string") {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          throw new TypeError(`Invalid date string format`);
        }
        return date;
      }

      // Handle number timestamps
      if (typeof value === "number") {
        // Check for negative
        if (value < 0) {
          throw new Error("Timestamp cannot be negative");
        }
        // Convert seconds to milliseconds if needed
        if (value < 10_000_000_000) return new Date(value * 1000);
        if (value >= 10_000_000_000_000) return new Date(value / 1000); // Microseconds
        return new Date(value); // Already milliseconds
      }

      // For any other type, let z.date() handle the error
      return value;
    }, z.date())
    .describe("A timestamp in various formats")
    .refine(
      (date) => {
        const time = date.getTime();
        // Check for valid date range
        // Min: January 1, 1970 (Unix epoch)
        // Max: December 31, 9999 (far future, but still representable)
        return time >= 0 && time <= 253_402_300_799_999;
      },
      {
        message:
          "Timestamp is out of valid range (must be between 1970 and 9999)",
      }
    );

// Export types
/**
 * Type representing a validated and normalized timestamp.
 * Always resolves to a Date object regardless of input format.
 */
export type Timestamp = z.infer<ReturnType<typeof timestamp>>;

/**
 * Type guard to check if a value is a valid timestamp.
 * @param value - The value to check
 * @returns `true` if the value can be parsed as a valid timestamp, `false` otherwise
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
 * @param value - The value to parse as a timestamp
 * @returns The normalized Date object
 * @throws {Error} If the value cannot be parsed as a valid timestamp
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
  return timestamp().parse(value);
}

/**
 * Custom JSON serializer for Date objects in ORPC endpoints.
 *
 * This serializer ensures proper handling of Date objects in JSON:
 * - Serializes Date to ISO string format for JSON compatibility
 * - Deserializes ISO strings back to Date objects
 * - Maintains timezone information in UTC format
 * - Provides consistent timestamp format across client-server communication
 *
 * @example
 * ```typescript
 * // In ORPC client/server configuration:
 * const handler = new RPCHandler(router, {
 *   customJsonSerializers: [timestampSerializer]
 * });
 * ```
 */
export const timestampSerializer: StandardRPCCustomJsonSerializer = {
  type: 35,
  condition: (data) => data instanceof Date,
  serialize: (data: Date) => data.toISOString(),
  deserialize: (data: string) => new Date(data),
};
