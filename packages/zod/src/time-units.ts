/**
 * Time Unit Validation Utilities
 *
 * This module provides Zod schemas for validating time measurement units,
 * essential for scheduling, vesting periods, lock durations, and other
 * time-based operations in financial applications.
 * @module TimeUnitValidation
 */
import { z } from "zod";

/**
 * Available time measurement units from seconds to years.
 * @remarks
 * Standard time units for various use cases:
 * - `seconds`: Precise timing, short intervals
 * - `minutes`: Short durations, meeting lengths
 * - `hours`: Medium durations, trading hours
 * - `days`: Daily operations, settlement periods
 * - `weeks`: Weekly cycles, short vesting
 * - `months`: Monthly periods, medium vesting
 * - `years`: Annual periods, long-term vesting
 */
export const timeUnits = [
  "seconds",
  "minutes",
  "hours",
  "days",
  "weeks",
  "months",
  "years",
] as const;

/**
 * Creates a Zod schema that validates time measurement units.
 * @returns A Zod enum schema for time unit validation
 * @example
 * ```typescript
 * const schema = timeUnit();
 *
 * // Valid time units
 * schema.parse("seconds"); // For precise timing
 * schema.parse("days");    // For daily periods
 * schema.parse("months");  // For monthly cycles
 * schema.parse("years");   // For annual periods
 *
 * // Invalid unit
 * schema.parse("decades"); // Throws ZodError
 * ```
 */
export const timeUnit = () =>
  z.enum(timeUnits).describe("Unit of time measurement");

/**
 * Type representing a validated time measurement unit.
 * Ensures type safety.
 */
export type TimeUnit = z.infer<ReturnType<typeof timeUnit>>;

/**
 * Type guard to check if a value is a valid time unit.
 * @param value - The value to check
 * @returns `true` if the value is a valid time unit, `false` otherwise
 * @example
 * ```typescript
 * const unit: unknown = "days";
 * if (isTimeUnit(unit)) {
 *   // TypeScript knows unit is TimeUnit
 *   console.log(`Valid time unit: ${unit}`);
 *
 *   // Use in calculations
 *   const duration = convertToSeconds(amount, unit);
 * }
 *
 * // Vesting period validation
 * if (isTimeUnit(vestingUnit)) {
 *   calculateVestingSchedule(vestingAmount, vestingUnit);
 * }
 * ```
 */
export function isTimeUnit(value: unknown): value is TimeUnit {
  return timeUnit().safeParse(value).success;
}

/**
 * Safely parse and return a time unit or throw an error.
 * @param value - The value to parse as a time unit
 * @returns The validated time unit
 * @throws {Error} If the value is not a valid time unit
 * @example
 * ```typescript
 * try {
 *   const unit = getTimeUnit("months"); // Returns "months" as TimeUnit
 *   const invalid = getTimeUnit("quarters"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid time unit provided");
 * }
 *
 * // Use in lock period configuration
 * const lockUnit = getTimeUnit(config.lockPeriodUnit);
 * const lockDuration = createLockPeriod(config.lockPeriodValue, lockUnit);
 *
 * // Token vesting setup
 * const vestingUnit = getTimeUnit(request.vestingUnit);
 * setupVesting(tokens, vestingPeriods, vestingUnit);
 * ```
 */
export function getTimeUnit(value: unknown): TimeUnit {
  return timeUnit().parse(value);
}
