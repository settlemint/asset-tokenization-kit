/**
 * Time Interval Validation Utilities
 *
 * This module provides Zod schemas for validating time intervals,
 * essential for scheduling, yield calculations, and other
 * time-based operations in financial applications.
 * @module TimeIntervalValidation
 */
import { z } from "zod";

/**
 * Tuple of valid time intervals for type-safe iteration.
 * @remarks
 * Standard time intervals for various use cases:
 * - `DAILY`: Daily intervals for daily yield calculations
 * - `WEEKLY`: Weekly intervals for weekly distributions
 * - `MONTHLY`: Monthly intervals for monthly payments
 * - `QUARTERLY`: Quarterly intervals for quarterly reports
 * - `YEARLY`: Yearly intervals for annual distributions
 */
export const timeIntervals = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
] as const;

/**
 * Enum-like object for dot notation access to time intervals.
 * Provides a convenient way to reference time intervals in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (interval === TimeIntervalEnum.DAILY) {
 *   console.log("Processing daily interval");
 * }
 *
 * // Use in switch statements
 * switch (paymentInterval) {
 *   case TimeIntervalEnum.DAILY:
 *     processDailyPayments();
 *     break;
 *   case TimeIntervalEnum.WEEKLY:
 *     processWeeklyPayments();
 *     break;
 * }
 * ```
 */
export const TimeIntervalEnum = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
} as const;

/**
 * Creates a Zod schema that validates time intervals.
 * @returns A Zod enum schema for time interval validation
 * @example
 * ```typescript
 * const schema = timeInterval();
 *
 * // Valid time intervals
 * schema.parse("DAILY");      // For daily calculations
 * schema.parse("WEEKLY");     // For weekly distributions
 * schema.parse("MONTHLY");    // For monthly payments
 * schema.parse("YEARLY");     // For annual distributions
 *
 * // Invalid interval
 * schema.parse("HOURLY");     // Throws ZodError
 * ```
 */
export const timeInterval = () =>
  z.enum(timeIntervals).describe("Time interval for scheduling");

/**
 * Type representing a validated time interval.
 * Ensures type safety for time interval operations.
 */
export type TimeInterval = z.infer<ReturnType<typeof timeInterval>>;

/**
 * Type guard to check if a value is a valid time interval.
 * @param value - The value to check
 * @returns `true` if the value is a valid time interval, `false` otherwise
 * @example
 * ```typescript
 * const interval: unknown = "DAILY";
 * if (isTimeInterval(interval)) {
 *   // TypeScript knows interval is TimeInterval
 *   console.log(`Valid time interval: ${interval}`);
 * }
 * ```
 */
export function isTimeInterval(value: unknown): value is TimeInterval {
  return timeInterval().safeParse(value).success;
}

/**
 * Safely parse and return a time interval or throw an error.
 * @param value - The value to parse as a time interval
 * @returns The validated time interval
 * @throws {Error} If the value is not a valid time interval
 * @example
 * ```typescript
 * try {
 *   const interval = getTimeInterval("MONTHLY"); // Returns "MONTHLY" as TimeInterval
 *   const invalid = getTimeInterval("HOURLY");   // Throws Error
 * } catch (error) {
 *   console.error("Invalid time interval provided");
 * }
 * ```
 */
export function getTimeInterval(value: unknown): TimeInterval {
  return timeInterval().parse(value);
}

/**
 * Time interval to seconds conversion mapping.
 * @remarks
 * Maps time interval constants to their equivalent seconds:
 * - `DAILY`: 86,400 seconds (1 day)
 * - `WEEKLY`: 604,800 seconds (7 days)
 * - `MONTHLY`: 2,629,746 seconds (30.44 days average month)
 * - `QUARTERLY`: 7,889,238 seconds (~91.33 days)
 * - `YEARLY`: 31,556,926 seconds (365.24 days)
 */
export const TIME_INTERVAL_SECONDS: Record<TimeInterval, number> = {
  DAILY: 86_400, // 1 day
  WEEKLY: 604_800, // 7 days
  MONTHLY: 2_629_746, // 30.44 days (average month)
  QUARTERLY: 7_889_238, // ~91.33 days
  YEARLY: 31_556_926, // 365.24 days
} as const;

/**
 * Converts a time interval constant to its equivalent in seconds.
 * @param interval - The time interval constant to convert
 * @returns The number of seconds for the given interval
 * @example
 * ```typescript
 * const dailySeconds = timeIntervalToSeconds("DAILY");     // 86400
 * const weeklySeconds = timeIntervalToSeconds("WEEKLY");   // 604800
 * const monthlySeconds = timeIntervalToSeconds("MONTHLY"); // 2629746
 *
 * // Use in smart contract calls
 * const paymentInterval = timeIntervalToSeconds("QUARTERLY");
 * await contract.setPaymentInterval(paymentInterval);
 * ```
 */
export function timeIntervalToSeconds(interval: TimeInterval): number {
  return TIME_INTERVAL_SECONDS[interval];
}
