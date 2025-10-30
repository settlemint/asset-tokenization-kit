/**
 * Ethereum TheGraph ID Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for Ethereum TheGraph composite IDs,
 * which are typically created by concatenating two Ethereum addresses (82 characters total).
 * These IDs are commonly used in subgraph mappings for compound entity identifiers.
 * @module EthereumGraphIdValidation
 */
import { type Hex, isHex } from "viem";
import { z } from "zod";

/**
 * Zod schema for validating and normalizing Ethereum TheGraph composite IDs (82 characters)
 *
 * This schema provides comprehensive validation for TheGraph composite IDs with the following features:
 * - Length validation (exactly 82 characters including '0x' prefix)
 * - Hexadecimal format validation using regex pattern
 * - Hex validity check using viem's `isHex` function
 * - Type-safe output as a validated Hex type
 *
 * These IDs are typically created by concatenating two Ethereum addresses:
 * - First address: 0x + 40 hex chars = 42 characters
 * - Second address: 0x + 40 hex chars = 42 characters
 * - Result: 0x + 80 hex chars = 82 characters total
 *
 * The validation process follows these steps:
 * 1. Check string length (must be exactly 82 characters)
 * 2. Validate hexadecimal format with regex
 * 3. Verify hex validity using viem's isHex
 * 4. Return as validated EthereumGraphId type
 * @example
 * ```typescript
 * // Valid TheGraph ID parsing (compliance address + module address)
 * const graphId = ethereumGraphId.parse("0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567890abcdef12345678");
 * // Returns: "0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567890abcdef12345678"
 * // Type: EthereumGraphId
 *
 * // Safe parsing with error handling
 * const result = ethereumGraphId.safeParse("invalid-id");
 * if (result.success) {
 *   console.log(result.data); // Valid graph ID
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 * ```
 * @throws {ZodError} When the input fails validation at any step
 */
export const ethereumCompositeId = z
  .string()
  .describe("A valid Ethereum Composite ID (82 characters, starting with 0x)")
  .min(82, "Ethereum Composite ID must be exactly 82 characters long")
  .max(82, "Ethereum Composite ID must be exactly 82 characters long")
  .regex(
    /^0x[a-fA-F0-9]{80}$/,
    "Ethereum Composite ID must start with '0x' followed by 80 hexadecimal characters"
  )
  .refine(isHex, {
    message: "Invalid Ethereum Composite ID format",
  })
  .transform((value): EthereumCompositeId => {
    return value as EthereumCompositeId;
  });

/**
 * Type representing a validated Ethereum Composite ID
 *
 * This type represents a validated Ethereum Composite ID
 * as a Hex string, typically used for compound entity identifiers
 * in subgraph schemas.
 */
export type EthereumCompositeId = Hex;

/**
 * Type guard function to check if a value is a valid Ethereum Composite ID
 *
 * This function provides runtime type checking for Composite IDs,
 * useful for conditional logic and type narrowing in TypeScript.
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid Composite ID, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567890abcdef12345678";
 *
 * if (isEthereumCompositeId(userInput)) {
 *   // TypeScript now knows userInput is EthereumCompositeId
 *   console.log(`Valid Composite ID: ${userInput}`);
 * } else {
 *   console.error("Invalid Composite ID provided");
 * }
 * ```
 */
export function isEthereumCompositeId(
  value: unknown
): value is EthereumCompositeId {
  return ethereumCompositeId.safeParse(value).success;
}

/**
 * Safely parse and validate an Ethereum TheGraph ID with error throwing
 *
 * This function attempts to parse and validate a Composite ID,
 * throwing a ZodError if validation fails. Use this when you expect
 * the input to be valid and want to handle errors at a higher level.
 * @param value - The value to parse and validate (can be any type)
 * @returns The validated Composite ID
 * @throws {ZodError} When the input fails validation
 * @example
 * ```typescript
 * try {
 *   const graphId = getEthereumCompositeId("0x1234567890abcdef1234567890abcdef12345678901234567890abcdef1234567890abcdef12345678");
 *   console.log(`Valid Composite ID: ${graphId}`);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     console.error("Validation failed:", error.issues);
 *   }
 * }
 * ```
 */
export function getEthereumCompositeId(value: unknown): EthereumCompositeId {
  return ethereumCompositeId.parse(value);
}
