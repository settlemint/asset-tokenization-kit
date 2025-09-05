/**
 * Ethereum Address Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for Ethereum addresses,
 * ensuring they conform to the EIP-55 checksummed format and integrating seamlessly
 * with viem's type system for enhanced type safety.
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
 * - Type-safe output matching viem's Address type
 *
 * The validation process follows these steps:
 * 1. Check string length (must be exactly 42 characters)
 * 2. Validate hexadecimal format with regex
 * 3. Verify address validity using viem's isAddress
 * 4. Transform to checksummed format using viem's getAddress
 * 5. Return as Address type
 * @example
 * ```typescript
 * // Valid address parsing
 * const address = ethereumAddress.parse("0x71c7656ec7ab88b098defb751b7401b5f6d8976f");
 * // Returns: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" (checksummed)
 * // Type: Address
 *
 * // Safe parsing with error handling
 * const result = ethereumAddress.safeParse("invalid-address");
 * if (result.success) {
 *   console.log(result.data); // Checksummed address
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 * ```
 * @throws {ZodError} When the input fails validation at any step
 */
export const ethereumAddress = z
  .string()
  .describe("A valid Ethereum address (42 characters, starting with 0x)")
  .min(42, "Ethereum address must be at least 42 characters long")
  .max(42, "Ethereum address must be at most 42 characters long")
  .regex(
    /^0x[a-fA-F0-9]{40}$/,
    "Ethereum address must start with 0x followed by 40 hexadecimal characters"
  )
  .refine(isAddress, {
    message: "Invalid Ethereum address format or checksum",
  })
  .transform((value): Address => {
    // Since we've already validated with isAddress in the refine step,
    // getAddress should always succeed. The transform directly returns
    // the checksummed address.
    return getAddress(value);
  });

/**
 * Type representing a validated and checksummed Ethereum address
 *
 * This type represents a validated and checksummed Ethereum address
 * using viem's Address type.
 */
export type EthereumAddress = Address;

/**
 *
 * @param value
 */
export function isEthereumAddress(value: unknown): value is EthereumAddress {
  return ethereumAddress.safeParse(value).success;
}

/**
 *
 * @param value
 */
export function getEthereumAddress(value: unknown): EthereumAddress {
  return ethereumAddress.parse(value);
}
