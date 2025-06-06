/**
 * Zod validator for timestamps
 *
 * This module provides a Zod schema for validating and transforming timestamps
 * in different formats (ISO string, milliseconds, seconds, or Date objects).
 */
import { z } from "zod/v4";

/**
 * Validates and normalizes a timestamp in various formats
 *
 * Features:
 * - Accepts ISO date strings
 * - Accepts Unix timestamps (seconds or milliseconds)
 * - Accepts JavaScript Date objects
 * - Handles string representations of numeric timestamps
 * - Automatically detects timestamp precision (seconds, milliseconds, microseconds, nanoseconds)
 * - Validates date ranges to prevent invalid dates
 * - Normalizes all inputs to Date objects
 *
 * @example
 * timestamp().parse("2023-04-01T12:00:00Z") // Date object
 * timestamp().parse(1680354000000) // Date from milliseconds
 * timestamp().parse(1680354000) // Date from seconds (auto-detected)
 * timestamp().parse(new Date()) // Pass-through Date objects
 * timestamp().parse("1680354000000") // String timestamps supported
 */
export const timestamp = () =>
  z
    .union([z.string(), z.number(), z.date()])
    .describe("A timestamp in various formats")
    .transform((value): Date => {
      // Handle null/undefined (shouldn't happen with union, but for safety)
      if (value === null || value === undefined) {
        throw new Error("Timestamp cannot be null or undefined");
      }

      // Handle Date objects
      if (value instanceof Date) {
        if (isNaN(value.getTime())) {
          throw new Error("Invalid Date object");
        }
        return value;
      }

      // Handle string inputs
      if (typeof value === "string") {
        // Check if it's a numeric string
        if (/^\d+$/.test(value)) {
          const num = Number(value);
          if (isNaN(num)) {
            throw new Error(`Invalid numeric timestamp string: ${value}`);
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
          throw new Error(`Invalid date string: ${value}`);
        }
        return date;
      }

      // Handle numeric inputs
      if (typeof value === "number") {
        // Check for valid range (JavaScript Date can safely handle dates up to year 275760)
        if (value < 0) {
          throw new Error("Timestamp cannot be negative");
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

      throw new Error(`Invalid timestamp type: ${typeof value}`);
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
        message: "Date must be between 1970 and 9999",
      }
    )
    .brand<"Timestamp">();

// Note: Global registry functionality removed as it's not available in Zod v4

/**
 * Validates timestamps with a minimum date constraint
 */
export const futureTimestamp = () =>
  timestamp().refine((date) => date.getTime() > Date.now(), {
    message: "Timestamp must be in the future",
  });

/**
 * Validates timestamps with a maximum date constraint
 */
export const pastTimestamp = () =>
  timestamp().refine((date) => date.getTime() < Date.now(), {
    message: "Timestamp must be in the past",
  });

/**
 * Validates timestamps within a specific range
 */
export const timestampInRange = (min: Date, max: Date) =>
  timestamp().refine(
    (date) => {
      const time = date.getTime();
      return time >= min.getTime() && time <= max.getTime();
    },
    {
      message: `Timestamp must be between ${min.toISOString()} and ${max.toISOString()}`,
    }
  );

/**
 * Validates timestamps with age constraints
 */
export const timestampWithMaxAge = (maxAgeMs: number) =>
  timestamp().refine((date) => Date.now() - date.getTime() <= maxAgeMs, {
    message: `Timestamp must be within the last ${maxAgeMs}ms`,
  });

// Export types
export type Timestamp = z.infer<ReturnType<typeof timestamp>>;
export type FutureTimestamp = z.infer<ReturnType<typeof futureTimestamp>>;
export type PastTimestamp = z.infer<ReturnType<typeof pastTimestamp>>;
export type TimestampInRange = z.infer<ReturnType<typeof timestampInRange>>;
export type TimestampWithMaxAge = z.infer<
  ReturnType<typeof timestampWithMaxAge>
>;

/**
 * Type guard to check if a value is a valid timestamp
 * @param value - The value to check
 * @returns true if the value is a valid timestamp
 */
export function isTimestamp(value: unknown): value is Timestamp {
  try {
    return timestamp().safeParse(value).success;
  } catch {
    return false;
  }
}

/**
 * Safely parse and return a timestamp or throw an error
 * @param value - The value to parse
 * @returns The timestamp if valid, throws when not
 */
export function getTimestamp(value: unknown): Timestamp {
  const result = timestamp().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid timestamp: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid future timestamp
 * @param value - The value to check
 * @returns true if the value is a valid future timestamp
 */
export function isFutureTimestamp(value: unknown): value is FutureTimestamp {
  try {
    return futureTimestamp().safeParse(value).success;
  } catch {
    return false;
  }
}

/**
 * Safely parse and return a future timestamp or throw an error
 * @param value - The value to parse
 * @returns The future timestamp if valid, throws when not
 */
export function getFutureTimestamp(value: unknown): FutureTimestamp {
  const result = futureTimestamp().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid future timestamp: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid past timestamp
 * @param value - The value to check
 * @returns true if the value is a valid past timestamp
 */
export function isPastTimestamp(value: unknown): value is PastTimestamp {
  try {
    return pastTimestamp().safeParse(value).success;
  } catch {
    return false;
  }
}

/**
 * Safely parse and return a past timestamp or throw an error
 * @param value - The value to parse
 * @returns The past timestamp if valid, throws when not
 */
export function getPastTimestamp(value: unknown): PastTimestamp {
  const result = pastTimestamp().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid past timestamp: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid timestamp in range
 * @param value - The value to check
 * @param min - Minimum date
 * @param max - Maximum date
 * @returns true if the value is a valid timestamp in range
 */
export function isTimestampInRange(
  value: unknown,
  min: Date,
  max: Date
): value is TimestampInRange {
  try {
    return timestampInRange(min, max).safeParse(value).success;
  } catch {
    return false;
  }
}

/**
 * Safely parse and return a timestamp in range or throw an error
 * @param value - The value to parse
 * @param min - Minimum date
 * @param max - Maximum date
 * @returns The timestamp in range if valid, throws when not
 */
export function getTimestampInRange(
  value: unknown,
  min: Date,
  max: Date
): TimestampInRange {
  const result = timestampInRange(min, max).safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid timestamp in range: ${value}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid timestamp with max age
 * @param value - The value to check
 * @param maxAgeMs - Maximum age in milliseconds
 * @returns true if the value is a valid timestamp with max age
 */
export function isTimestampWithMaxAge(
  value: unknown,
  maxAgeMs: number
): value is TimestampWithMaxAge {
  try {
    return timestampWithMaxAge(maxAgeMs).safeParse(value).success;
  } catch {
    return false;
  }
}

/**
 * Safely parse and return a timestamp with max age or throw an error
 * @param value - The value to parse
 * @param maxAgeMs - Maximum age in milliseconds
 * @returns The timestamp with max age if valid, throws when not
 */
export function getTimestampWithMaxAge(
  value: unknown,
  maxAgeMs: number
): TimestampWithMaxAge {
  const result = timestampWithMaxAge(maxAgeMs).safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid timestamp with max age: ${value}`);
  }
  return result.data;
}
