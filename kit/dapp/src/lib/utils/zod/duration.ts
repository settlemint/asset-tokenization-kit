import { z } from "zod/v4";

export const duration = () =>
  z
    .number()
    .int("Duration must be in milliseconds")
    .positive("Duration must be positive")
    .describe("Duration in milliseconds")
    .brand<"Duration">();

export type Duration = z.infer<ReturnType<typeof duration>>;

/**
 * Type guard to check if a value is a valid duration
 * @param value - The value to check
 * @returns true if the value is a valid duration
 */
export function isDuration(value: unknown): value is Duration {
  return duration().safeParse(value).success;
}

/**
 * Safely parse and return a duration or throw an error
 * @param value - The value to parse
 * @returns The duration if valid, throws when not
 */
export function getDuration(value: unknown): Duration {
  if (!isDuration(value)) {
    throw new Error(`Invalid duration: ${value}`);
  }
  return value;
}
