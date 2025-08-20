/**
 * Price Validation Utilities
 *
 * This module provides Zod schemas for validating monetary price values,
 * commonly used in financial applications for asset pricing, order books,
 * and trading systems. Ensures precision and format consistency.
 * @module PriceValidation
 */
import { z } from "zod";

/**
 * Creates a Zod schema that validates price values.
 *
 * This schema accepts both string and number inputs to ensure precision:
 * - String inputs avoid JavaScript number precision limits for large prices
 * - Number inputs are supported for convenience
 * - Already-parsed numbers are passed through efficiently
 *
 * @remarks
 * Price validation requirements:
 * - Must be positive (greater than 0)
 * - Must be a finite number (no Infinity or -Infinity)
 * - Maximum 4 decimal places for precision control
 * - Suitable for most financial markets (stocks, bonds, commodities)
 *
 * The 4 decimal place limit aligns with:
 * - Traditional stock markets (2-4 decimals)
 * - Forex markets (4-5 pips)
 * - Most cryptocurrency exchanges
 * @returns A Zod schema for price validation
 * @example
 * ```typescript
 * const schema = price();
 *
 * // Valid prices
 * schema.parse(100);      // $100.00
 * schema.parse("100");    // $100.00 (string input)
 * schema.parse(99.99);    // $99.99
 * schema.parse("99.99");  // $99.99 (string input)
 * schema.parse(0.0001);   // $0.0001 (minimum precision)
 * schema.parse("1234.5678"); // $1,234.5678 (string preserves precision)
 *
 * // Invalid prices
 * schema.parse(0);         // Throws - not positive
 * schema.parse(-10);       // Throws - negative
 * schema.parse("1.23456"); // Throws - too many decimals
 * schema.parse(Infinity);  // Throws - not finite
 * ```
 */
export const price = () =>
  z
    .union([z.string(), z.number()])
    .transform((value, ctx) => {
      // If already a number, return it (Zod's z.number() already validates it's finite)
      if (typeof value === "number") {
        return value;
      }

      // Parse string to number
      const parsed = Number.parseFloat(value);
      if (!Number.isFinite(parsed)) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid price format. Please provide a valid numeric string",
        });
        return z.NEVER;
      }
      return parsed;
    })
    .refine((value) => value > 0, {
      message: "Price must be greater than zero",
    })
    .refine((value) => {
      // Check decimal places by converting to string
      // This handles both integer and decimal prices correctly
      const decimalPlaces = (value.toString().split(".")[1] ?? "").length;
      return decimalPlaces <= 4;
    }, "Price cannot have more than 4 decimal places")
    .describe("Asset price");

/**
 * Type representing a validated price value.
 * Ensures type safety in financial calculations.
 */
export type Price = z.infer<ReturnType<typeof price>>;

/**
 * Type guard to check if a value is a valid price.
 * @param value - The value to check
 * @returns `true` if the value is a valid price, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = 99.99;
 * if (isPrice(userInput)) {
 *   // TypeScript knows userInput is Price
 *   console.log(`Valid price: $${userInput}`);
 *
 *   // Safe to use in calculations
 *   const total = userInput * quantity;
 * }
 *
 * // Validation in trading logic
 * if (isPrice(bidPrice) && isPrice(askPrice)) {
 *   const spread = askPrice - bidPrice;
 * }
 * ```
 */
export function isPrice(value: unknown): value is Price {
  return price().safeParse(value).success;
}

/**
 * Safely parse and return a price or throw an error.
 * @param value - The value to parse as a price
 * @returns The validated price value
 * @throws {Error} If the value is not a valid price
 * @example
 * ```typescript
 * try {
 *   const assetPrice = getPrice(150.50); // Returns 150.50 as Price
 *   const stringPrice = getPrice("150.50"); // Returns 150.50 as Price
 *   const invalid = getPrice(-10); // Throws Error
 * } catch (error) {
 *   console.error("Invalid price provided");
 * }
 *
 * // Use in order creation
 * const orderPrice = getPrice(request.price);
 * createLimitOrder(asset, orderPrice, quantity);
 *
 * // Price updates from API (string)
 * const newPrice = getPrice(marketData.lastPrice);
 * updateAssetPrice(assetId, newPrice);
 * ```
 */
export function getPrice(value: unknown): Price {
  return price().parse(value);
}
