import { z } from "zod";

export const decimals = () =>
  z
    .number()
    .int("Decimals must be an integer")
    .min(0, "Decimals must be non-negative")
    .max(18, "Decimals must be 18 or less")
    .describe("Number of decimal places for the asset")
    .brand<"Decimals">();

export type Decimals = z.infer<ReturnType<typeof decimals>>;

/**
 * Type guard to check if a value is valid decimals
 * @param value - The value to check
 * @returns true if the value is valid decimals
 */
export function isDecimals(value: unknown): value is Decimals {
  return decimals().safeParse(value).success;
}

/**
 * Safely parse and return decimals or throw an error
 * @param value - The value to parse
 * @returns The decimals if valid, throws when not
 */
export function getDecimals(value: unknown): Decimals {
  if (!isDecimals(value)) {
    throw new Error(`Invalid decimals: ${value}`);
  }
  return value;
}
