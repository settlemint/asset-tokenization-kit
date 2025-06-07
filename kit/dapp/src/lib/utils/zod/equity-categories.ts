import { z } from "zod";

export const equityCategories = ["common", "preferred", "restricted"] as const;

export const equityCategory = () =>
  z
    .enum(equityCategories)
    .describe("Category of equity")
    .brand<"EquityCategory">();

export type EquityCategory = z.infer<ReturnType<typeof equityCategory>>;

/**
 * Type guard to check if a value is a valid equity category
 * @param value - The value to check
 * @returns true if the value is a valid equity category
 */
export function isEquityCategory(value: unknown): value is EquityCategory {
  return equityCategory().safeParse(value).success;
}

/**
 * Safely parse and return an equity category or throw an error
 * @param value - The value to parse
 * @returns The equity category if valid, throws when not
 */
export function getEquityCategory(value: unknown): EquityCategory {
  if (!isEquityCategory(value)) {
    throw new Error(`Invalid equity category: ${value}`);
  }
  return value;
}
