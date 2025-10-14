/**
 * Ethereum Hash Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for Ethereum hashes (32 bytes),
 * ensuring they conform to the standard hex format and integrating seamlessly
 * with viem's type system for enhanced type safety.
 * @module EthereumHashValidation
 */
import { type Hex, isHash } from "viem";
import * as z from "zod";

/**
 * Zod schema for validating and normalizing Ethereum hashes (32 bytes)
 *
 * This schema provides comprehensive validation for Ethereum hashes with the following features:
 * - Length validation (exactly 66 characters including '0x' prefix)
 * - Hexadecimal format validation using regex pattern
 * - Hash validity check using viem's `isHash` function
 * - Type-safe output as a validated string
 *
 * The validation process follows these steps:
 * 1. Check string length (must be exactly 66 characters)
 * 2. Validate hexadecimal format with regex
 * 3. Verify hash validity using viem's isHash
 * 4. Return as validated Hash type
 * @example
 * ```typescript
 * // Valid hash parsing
 * const hash = ethereumHash.parse("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
 * // Returns: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 * // Type: string
 *
 * // Safe parsing with error handling
 * const result = ethereumHash.safeParse("invalid-hash");
 * if (result.success) {
 *   console.log(result.data); // Valid hash
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 * ```
 * @throws {ZodError} When the input fails validation at any step
 */
export const ethereumHash = z
  .string()
  .describe("A valid Ethereum hash (66 characters, starting with 0x)")
  .min(66, "Ethereum hash must be exactly 66 characters long")
  .max(66, "Ethereum hash must be exactly 66 characters long")
  .regex(
    /^0x[a-fA-F0-9]{64}$/,
    "Ethereum hash must start with '0x' followed by 64 hexadecimal characters"
  )
  .refine(isHash, {
    message: "Invalid Ethereum hash format",
  })
  .transform((value): EthereumHash => {
    return value as EthereumHash;
  });

/**
 * Type representing a validated Ethereum hash
 *
 * This type represents a validated Ethereum hash
 * as a string.
 */
export type EthereumHash = Hex;

/**
 * Type guard function to check if a value is a valid Ethereum hash
 *
 * This function provides runtime type checking for Ethereum hashes,
 * useful for conditional logic and type narrowing in TypeScript.
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid Ethereum hash, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
 *
 * if (isEthereumHash(userInput)) {
 *   // TypeScript now knows userInput is EthereumHash
 *   console.log(`Valid hash: ${userInput}`);
 * } else {
 *   console.error("Invalid hash provided");
 * }
 * ```
 */
export function isEthereumHash(value: unknown): value is EthereumHash {
  return ethereumHash.safeParse(value).success;
}

/**
 * Safely parse and validate an Ethereum hash with error throwing
 *
 * This function attempts to parse and validate an Ethereum hash,
 * throwing a ZodError if validation fails. Use this when you expect
 * the input to be valid and want to handle errors at a higher level.
 * @param value - The value to parse and validate (can be any type)
 * @returns The validated Ethereum hash
 * @throws {ZodError} When the input fails validation
 * @example
 * ```typescript
 * try {
 *   const hash = getEthereumHash("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
 *   console.log(`Valid hash: ${hash}`);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     console.error("Validation failed:", error.issues);
 *   }
 * }
 * ```
 */
export function getEthereumHash(value: unknown): EthereumHash {
  return ethereumHash.parse(value);
}
