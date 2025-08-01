/**
 * Ethereum Hex Data Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for Ethereum hex data,
 * including ABI-encoded parameters, calldata, and other variable-length hex strings.
 * @module EthereumHexValidation
 */
import { isHex, type Hex } from "viem";
import { z } from "zod";

/**
 * Zod schema for validating Ethereum hex data (variable length)
 *
 * This schema provides validation for any valid Ethereum hex data with the following features:
 * - Minimum length validation (at least 2 characters for '0x')
 * - Hexadecimal format validation using viem's `isHex` function
 * - Type-safe output as a validated Hex type
 *
 * @example
 * ```typescript
 * // Valid hex data parsing
 * const data = ethereumHex.parse("0x1234abcd");
 * // Returns: "0x1234abcd"
 * // Type: Hex
 *
 * // ABI-encoded parameters
 * const encoded = ethereumHex.parse("0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000038");
 * ```
 */
export const ethereumHex = z
  .string()
  .describe("A valid Ethereum hex string (starting with 0x)")
  .min(2, "Hex string must be at least 2 characters long (0x)")
  .refine(isHex, {
    message:
      "Invalid hex format - must start with '0x' followed by hexadecimal characters",
  })
  .transform((value): Hex => {
    return value as Hex;
  });

/**
 * Type representing validated Ethereum hex data
 */
export type EthereumHex = Hex;

/**
 * Type guard function to check if a value is valid Ethereum hex data
 */
export function isEthereumHex(value: unknown): value is EthereumHex {
  return ethereumHex.safeParse(value).success;
}

/**
 * Safely parse and validate Ethereum hex data with error throwing
 */
export function getEthereumHex(value: unknown): EthereumHex {
  return ethereumHex.parse(value);
}
