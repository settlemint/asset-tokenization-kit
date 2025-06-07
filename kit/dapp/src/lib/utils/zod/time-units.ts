import { z } from "zod";

export const timeUnits = [
  "seconds",
  "minutes",
  "hours",
  "days",
  "weeks",
  "months",
  "years",
] as const;

export const timeUnit = () =>
  z.enum(timeUnits).describe("Unit of time measurement").brand<"TimeUnit">();

export type TimeUnit = z.infer<ReturnType<typeof timeUnit>>;

/**
 * Type guard to check if a value is a valid time unit
 * @param value - The value to check
 * @returns true if the value is a valid time unit
 */
export function isTimeUnit(value: unknown): value is TimeUnit {
  return timeUnit().safeParse(value).success;
}

/**
 * Safely parse and return a time unit or throw an error
 * @param value - The value to parse
 * @returns The time unit if valid, throws when not
 */
export function getTimeUnit(value: unknown): TimeUnit {
  if (!isTimeUnit(value)) {
    throw new Error(`Invalid time unit: ${value}`);
  }
  return value;
}
