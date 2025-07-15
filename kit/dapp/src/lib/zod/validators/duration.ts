/**
 * Duration Validation Utilities
 *
 * This module provides Zod schemas for validating time duration values,
 * typically used for timeouts, intervals, and scheduling in applications.
 * All durations are expressed in milliseconds for precision.
 * @module DurationValidation
 */
import { z } from "zod";

/**
 * Creates a Zod schema that validates duration values in milliseconds.
 * @remarks
 * - Must be an integer (no fractional milliseconds)
 * - Must be positive (greater than 0)
 * - Common use cases: animation durations, API timeouts, polling intervals
 * - For human-readable time periods, convert: 1000ms = 1s, 60000ms = 1m
 * @returns A Zod schema for duration validation
 * @example
 * ```typescript
 * const schema = duration();
 *
 * // Valid durations
 * schema.parse(100);     // 100ms
 * schema.parse(1000);    // 1 second
 * schema.parse(60000);   // 1 minute
 * schema.parse(3600000); // 1 hour
 *
 * // Invalid durations
 * schema.parse(0);       // Throws - must be positive
 * schema.parse(-1000);   // Throws - negative
 * schema.parse(100.5);   // Throws - not integer
 * ```
 */
export const duration = () =>
  z
    .number()
    .int("Duration must be a whole number of milliseconds")
    .positive("Duration must be greater than zero") // Greater than 0
    .describe("Duration in milliseconds");

/**
 * Type representing a validated duration in milliseconds.
 * Ensures type safety.
 */
export type Duration = z.infer<ReturnType<typeof duration>>;

/**
 * Type guard to check if a value is a valid duration.
 * @param value - The value to check
 * @returns `true` if the value is a valid duration, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = 5000;
 * if (isDuration(userInput)) {
 *   // TypeScript knows userInput is Duration
 *   console.log(`Valid duration: ${userInput}ms`);\n *   const seconds = userInput / 1000;
 * }
 *
 * // Use in conditional logic
 * if (isDuration(config.timeout)) {
 *   setTimeout(callback, config.timeout);
 * }
 * ```
 */
export function isDuration(value: unknown): value is Duration {
  return duration().safeParse(value).success;
}

/**
 * Safely parse and return a duration or throw an error.
 * @param value - The value to parse as a duration
 * @returns The validated duration in milliseconds
 * @throws {Error} If the value is not a valid duration
 * @example
 * ```typescript
 * try {
 *   const timeout = getDuration(5000); // Returns 5000ms
 *   const invalid = getDuration(0); // Throws Error - not positive
 * } catch (error) {
 *   console.error("Invalid duration provided");
 * }
 *
 * // Use in timing operations
 * const animationDuration = getDuration(config.animationMs);
 * element.style.transition = `all ${animationDuration}ms ease`;
 * ```
 */
export function getDuration(value: unknown): Duration {
  return duration().parse(value);
}
