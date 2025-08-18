import { bigDecimal } from "@/lib/zod/validators/bigdecimal";
import { toNumber } from "dnum";

/**
 * Helper function to safely convert a value to a number for formatting
 * Uses dnum for precision handling when the value is a string
 * Returns 0 for NaN values
 */
export function safeToNumber(value: unknown): number {
  // If it's already a number, check for NaN
  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }

  // If it's a string, try to parse it with dnum for precision
  if (typeof value === "string") {
    try {
      const bigDecimalValue = bigDecimal().parse(value);
      const num = toNumber(bigDecimalValue);
      return Number.isNaN(num) ? 0 : num;
    } catch {
      // If parsing fails, fallback to Number conversion
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    }
  }

  // For other types, use Number conversion
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}
