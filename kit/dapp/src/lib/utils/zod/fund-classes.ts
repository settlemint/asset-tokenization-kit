import { z } from "zod";

export const fundClasses = ["institutional", "retail", "accredited"] as const;

export const fundClass = () =>
  z.enum(fundClasses).describe("Class of fund shares").brand<"FundClass">();

export type FundClass = z.infer<ReturnType<typeof fundClass>>;

/**
 * Type guard to check if a value is a valid fund class
 * @param value - The value to check
 * @returns true if the value is a valid fund class
 */
export function isFundClass(value: unknown): value is FundClass {
  return fundClass().safeParse(value).success;
}

/**
 * Safely parse and return a fund class or throw an error
 * @param value - The value to parse
 * @returns The fund class if valid, throws when not
 */
export function getFundClass(value: unknown): FundClass {
  if (!isFundClass(value)) {
    throw new Error(`Invalid fund class: ${value}`);
  }
  return value;
}
