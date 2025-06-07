/**
 * Ethereum Address Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for Ethereum addresses,
 * ensuring they conform to the EIP-55 checksummed format and integrating seamlessly
 * with viem's type system for enhanced type safety.
 *
 * @module EthereumAddressValidation
 */
import { type Address, getAddress, isAddress } from "viem";
import { z } from "zod";

/**
 * Zod schema for validating and normalizing Ethereum addresses
 *
 * This schema provides comprehensive validation for Ethereum addresses with the following features:
 * - Length validation (exactly 42 characters including '0x' prefix)
 * - Hexadecimal format validation using regex pattern
 * - Address validity check using viem's `isAddress` function
 * - Automatic transformation to EIP-55 checksummed format
 * - Type-safe output using viem's `Address` type
 * - Branded type for additional compile-time safety
 *
 * The validation process follows these steps:
 * 1. Check string length (must be exactly 42 characters)
 * 2. Validate hexadecimal format with regex
 * 3. Verify address validity using viem's isAddress
 * 4. Transform to checksummed format using viem's getAddress
 * 5. Return as branded Address type
 *
 * @example
 * ```typescript
 * // Valid address parsing
 * const address = ethereumAddress.parse("0x71c7656ec7ab88b098defb751b7401b5f6d8976f");
 * // Returns: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" (checksummed)
 * // Type: Address & Brand<"EthereumAddress">
 *
 * // Safe parsing with error handling
 * const result = ethereumAddress.safeParse("invalid-address");
 * if (result.success) {
 *   console.log(result.data); // Checksummed address
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 * ```
 *
 * @throws {ZodError} When the input fails validation at any step
 */
export const ethereumAddress = z
  .string()
  .describe("A valid Ethereum address (42 characters, starting with 0x)")
  .min(42, "Ethereum addresses are 42 characters long")
  .max(42, "Ethereum addresses are 42 characters long")
  .regex(
    /^0x[a-fA-F0-9]{40}$/,
    "Please enter a valid Ethereum address starting with '0x' followed by 40 characters"
  )
  .refine(isAddress, {
    message: "Please enter a valid Ethereum address",
  })
  .transform((value): Address => {
    try {
      return getAddress(value);
    } catch {
      // This should never happen since we've already validated with isAddress
      // but we include this fallback for defensive programming
      return value as Address;
    }
  })
  .brand<"EthereumAddress">();

/**
 * Type representing a validated and checksummed Ethereum address
 *
 * This type combines viem's Address type with a brand for additional
 * compile-time safety, ensuring that only validated addresses can be
 * assigned to variables of this type.
 */
export type EthereumAddress = z.output<typeof ethereumAddress>;

/**
 * Type guard function to check if a value is a valid Ethereum address
 *
 * This function provides runtime type checking for Ethereum addresses,
 * useful for conditional logic and type narrowing in TypeScript.
 *
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid Ethereum address, `false` otherwise
 *
 * @example
 * ```typescript
 * const userInput: unknown = "0x742d35Cc6634C0532925a3b844Bc9e7595f5b899";
 *
 * if (isEthereumAddress(userInput)) {
 *   // TypeScript now knows userInput is EthereumAddress
 *   console.log(`Valid address: ${userInput}`);
 * } else {
 *   console.error("Invalid address provided");
 * }
 * ```
 */
export function isEthereumAddress(value: unknown): value is EthereumAddress {
  return ethereumAddress.safeParse(value).success;
}

/**
 * Safely parse and validate an Ethereum address with error throwing
 *
 * This function attempts to parse and validate an Ethereum address,
 * throwing a ZodError if validation fails. Use this when you expect
 * the input to be valid and want to handle errors at a higher level.
 *
 * @param value - The value to parse and validate (can be any type)
 * @returns The validated and checksummed Ethereum address
 * @throws {ZodError} When the input fails validation
 *
 * @example
 * ```typescript
 * try {
 *   const address = getEthereumAddress("0x71c7656ec7ab88b098defb751b7401b5f6d8976f");
 *   console.log(`Checksummed address: ${address}`);
 * } catch (error) {
 *   if (error instanceof ZodError) {
 *     console.error("Validation failed:", error.issues);
 *   }
 * }
 * ```
 */
export function getEthereumAddress(value: unknown): EthereumAddress {
  return ethereumAddress.parse(value);
}
