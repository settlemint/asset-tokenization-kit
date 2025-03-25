/**
 * TypeBox validator for timestamps
 *
 * This module provides a TypeBox schema for validating and transforming timestamps
 * in different formats (ISO string, milliseconds, or Date objects).
 */
import type { SchemaOptions } from "@sinclair/typebox";
import { FormatRegistry, t, TypeRegistry } from "elysia/type-system";

// Union type for timestamps input
type TimestampInput = string | number | Date;

// Timestamp format validator
if (!FormatRegistry.Has("timestamp")) {
  FormatRegistry.Set("timestamp", (value: any) => {
    if (typeof value === "string") {
      // Validate ISO string
      return !isNaN(Date.parse(value));
    } else if (typeof value === "number") {
      // Validate milliseconds timestamp
      return !isNaN(new Date(value).getTime());
    } else if (value instanceof Date) {
      // Validate Date object
      return !isNaN(value.getTime());
    }
    return false;
  });
}

if (!TypeRegistry.Has("timestamp")) {
  TypeRegistry.Set<Date>("timestamp", (_schema, value) => {
    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }
    return false;
  });
}

/**
 * Validates and normalizes a timestamp in any valid format
 *
 * Accepts ISO date strings, milliseconds since epoch, or Date objects,
 * and normalizes them to a Date object.
 *
 * @param options - Additional schema options
 * @returns A TypeBox schema that validates and transforms timestamps
 */
export const Timestamp = (options?: SchemaOptions) =>
  t
    .Transform(
      t.Any({
        format: "timestamp",
        title: "Timestamp",
        description:
          "A timestamp (ISO string, milliseconds, or Date object) that will be normalized to a Date object",
        examples: [
          "2023-04-01T12:00:00Z",
          1680354000000,
          new Date("2023-04-01T12:00:00Z"),
        ],
        ...options,
      })
    )
    .Decode((value: TimestampInput) => {
      if (typeof value === "string") {
        // Check if it looks like a Unix timestamp (seconds)
        if (/^\d{10}$/.test(value)) {
          return new Date(parseInt(value) * 1000);
        }
        return new Date(value);
      } else if (typeof value === "number") {
        // JavaScript Date can safely handle dates up to year 275760
        // For reference: Year 2100 in milliseconds ~= 4.1 trillion
        if (value < 10000000000) {
          return new Date(value * 1000); // Seconds to milliseconds
        } else if (value >= 10000000000000) {
          return new Date(value / 1000); // Microseconds to milliseconds
        }
        return new Date(value); // Already in milliseconds
      } else if (value instanceof Date) {
        return value;
      }
      throw new Error("Invalid timestamp format");
    })
    .Encode((value: Date) => value);
