import { z } from "zod/v4";

export const fundCategories = ["mutual", "hedge", "etf", "index"] as const;

export const fundCategory = () =>
  z
    .enum(fundCategories)
    .describe("Category of investment fund")
    .brand<"FundCategory">();

export type FundCategory = z.infer<ReturnType<typeof fundCategory>>;

/**
 * Type guard to check if a value is a valid fund category
 * @param value - The value to check
 * @returns true if the value is a valid fund category
 */
export function isFundCategory(value: unknown): value is FundCategory {
  return fundCategory().safeParse(value).success;
}

/**
 * Safely parse and return a fund category or throw an error
 * @param value - The value to parse
 * @returns The fund category if valid, throws when not
 */
export function getFundCategory(value: unknown): FundCategory {
  if (!isFundCategory(value)) {
    throw new Error(`Invalid fund category: ${value}`);
  }
  return value;
}
