/**
 * Asset Symbol Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for trading symbols
 * used to identify financial assets, ensuring they conform to standard
 * market conventions and format requirements.
 * @module AssetSymbolValidation
 */
import { z } from "zod";

/**
 * Zod schema for validating trading symbols for financial assets
 *
 * This schema provides comprehensive validation for asset symbols with the following features:
 * - Length validation (1-12 characters for compatibility with most exchanges)
 * - Format validation (uppercase letters and numbers only)
 * - Empty string rejection
 * - Type-safe string validation
 * - Market standard compliance
 *
 * Asset symbol format requirements:
 * - Must contain only uppercase letters (A-Z) and numbers (0-9)
 * - Minimum length: 1 character
 * - Maximum length: 12 characters (NYSE/NASDAQ standard)
 * - No special characters, spaces, or lowercase letters allowed
 * - Commonly used patterns: "AAPL", "MSFT", "BTC", "ETH", "SPY", etc.
 *
 * The validation process follows these steps:
 * 1. Check minimum length (at least 1 character)
 * 2. Check maximum length (at most 12 characters)
 * 3. Validate format using regex (uppercase alphanumeric only)
 * 4. Return as validated AssetSymbol type
 * @example
 * ```typescript
 * // Valid asset symbol parsing
 * const appleSymbol = assetSymbol().parse("AAPL");
 * // Returns: "AAPL"
 * // Type: string
 *
 * const bitcoinSymbol = assetSymbol().parse("BTC");
 * // Returns: "BTC"
 *
 * const spySymbol = assetSymbol().parse("SPY");
 * // Returns: "SPY"
 *
 * // Numeric symbols (some crypto exchanges)
 * const numericSymbol = assetSymbol().parse("1INCH");
 * // Returns: "1INCH"
 *
 * // Safe parsing with error handling
 * const result = assetSymbol().safeParse("invalid-symbol");
 * if (result.success) {
 *   console.log(result.data); // Valid symbol
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 *
 * // Type guard usage
 * if (isAssetSymbol(userInput)) {
 *   // TypeScript knows userInput is AssetSymbol
 *   console.log(`Valid symbol: ${userInput}`);
 * }
 * ```
 * @throws {ZodError} When the input fails validation at any step
 */
export const assetSymbol = () =>
  z
    .string()
    .min(1, "Asset symbol is required")
    .max(12, "Asset symbol must not exceed 12 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Asset symbol must contain only uppercase letters (A-Z) and numbers (0-9)"
    )
    .describe("Trading symbol for the asset");

// Note: Global registry functionality removed as it's not available in Zod v4

/**
 * Type representing a validated asset trading symbol
 *
 * This type represents a validated asset trading symbol as a string.
 */
export type AssetSymbol = z.infer<ReturnType<typeof assetSymbol>>;

/**
 * Type guard function to check if a value is a valid asset symbol
 *
 * This function provides runtime type checking for asset symbols,
 * useful for conditional logic and type narrowing in TypeScript.
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid asset symbol, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "AAPL";
 *
 * if (isAssetSymbol(userInput)) {
 *   // TypeScript now knows userInput is AssetSymbol
 *   console.log(`Valid asset symbol: ${userInput}`);
 * } else {
 *   console.error("Invalid asset symbol provided");
 * }
 * ```
 */
export function isAssetSymbol(value: unknown): value is AssetSymbol {
  return assetSymbol().safeParse(value).success;
}

/**
 * Safely parse and validate an asset symbol with error throwing
 *
 * This function attempts to parse and validate an asset symbol,
 * throwing a ZodError if validation fails. Use this when you expect
 * the input to be valid and want to handle errors at a higher level.
 * @param value - The value to parse and validate (can be any type)
 * @returns The validated asset symbol
 * @throws {Error} When the input fails validation
 * @example
 * ```typescript
 * try {
 *   const symbol = getAssetSymbol("AAPL");
 *   console.log(`Valid asset symbol: ${symbol}`);
 * } catch (error) {
 *   console.error("Validation failed:", error.message);
 * }
 * ```
 */
export function getAssetSymbol(value: unknown): AssetSymbol {
  return assetSymbol().parse(value);
}
