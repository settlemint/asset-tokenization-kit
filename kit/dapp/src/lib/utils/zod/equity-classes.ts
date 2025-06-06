import { z } from "zod/v4";

export const equityClasses = ["A", "B", "C"] as const;

export const equityClass = () =>
  z
    .enum(equityClasses)
    .describe("Class of equity shares")
    .brand<"EquityClass">();

export type EquityClass = z.infer<ReturnType<typeof equityClass>>;

/**
 * Type guard to check if a value is a valid equity class
 * @param value - The value to check
 * @returns true if the value is a valid equity class
 */
export function isEquityClass(value: unknown): value is EquityClass {
  return equityClass().safeParse(value).success;
}

/**
 * Safely parse and return an equity class or throw an error
 * @param value - The value to parse
 * @returns The equity class if valid, throws when not
 */
export function getEquityClass(value: unknown): EquityClass {
  if (!isEquityClass(value)) {
    throw new Error(`Invalid equity class: ${value}`);
  }
  return value;
}
