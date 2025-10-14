/**
 * PIN Code Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for 6-digit PIN codes
 * used in authentication systems, ensuring they conform to security standards
 * and format requirements for reliable user verification.
 * @module PincodeValidation
 */
import * as z from "zod";

/**
 * Zod schema for validating 6-digit PIN codes
 *
 * This schema provides comprehensive validation for PIN codes with the following features:
 * - Exact length validation (must be 6 digits)
 * - Numeric-only validation (0-9 characters only)
 * - Format consistency for authentication systems
 * - Security-focused validation patterns
 *
 * PIN code format requirements:
 * - Must be exactly 6 characters long
 * - Must contain only numeric digits (0-9)
 * - No letters, spaces, or special characters allowed
 * - Leading zeros are preserved (e.g., "000123" is valid)
 * - Common for mobile authentication, banking, and secure access
 *
 * The validation process follows these steps:
 * 1. Check exact length (must be 6 characters)
 * 2. Validate format using regex (digits only)
 * 3. Ensure no non-numeric characters
 * @example
 * ```typescript
 * // Valid PIN code parsing
 * const userPin = pincode().parse("123456");
 * // Returns: "123456"
 * // Type: string
 *
 * const pinWithLeadingZeros = pincode().parse("000123");
 * // Returns: "000123"
 *
 * const bankPin = pincode().parse("987654");
 * // Returns: "987654"
 *
 * // Safe parsing with error handling
 * const result = pincode().safeParse("12345"); // Too short
 * if (result.success) {
 *   console.log(result.data); // Valid PIN
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 *
 * // Type guard usage
 * if (isPincode(userInput)) {
 *   // TypeScript knows userInput is Pincode
 *   console.log(`Valid PIN: ${userInput}`);
 * }
 *
 * // Invalid examples
 * pincode().parse("12345");    // throws - too short
 * pincode().parse("1234567");  // throws - too long
 * pincode().parse("12345a");   // throws - contains letter
 * pincode().parse("123 456");  // throws - contains space
 * ```
 * @throws {ZodError} When the input fails validation at any step
 */
export const pincode = () =>
  z
    .string()
    .length(6, "PIN code must be exactly 6 digits")
    .regex(/^\d{6}$/, "PIN code must contain only numeric digits (0-9)")
    .describe("6-digit PIN code");

// Note: Global registry functionality removed as it's not available in Zod v4

/**
 * Type representing a validated 6-digit PIN code
 *
 * This type ensures that only validated PIN codes can be assigned to variables of this type.
 */
export type Pincode = z.infer<ReturnType<typeof pincode>>;

/**
 * Type guard function to check if a value is a valid PIN code
 *
 * This function provides runtime type checking for PIN codes,
 * useful for conditional logic and type narrowing in TypeScript.
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid PIN code, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "123456";
 *
 * if (isPincode(userInput)) {
 *   // TypeScript now knows userInput is Pincode
 *   console.log(`Valid PIN: ${userInput}`);
 * } else {
 *   console.error("Invalid PIN code provided");
 * }
 * ```
 */
export function isPincode(value: unknown): value is Pincode {
  return pincode().safeParse(value).success;
}

/**
 * Safely parse and validate a PIN code with error throwing
 *
 * This function attempts to parse and validate a PIN code,
 * throwing a ZodError if validation fails. Use this when you expect
 * the input to be valid and want to handle errors at a higher level.
 * @param value - The value to parse and validate (can be any type)
 * @returns The validated PIN code
 * @throws {Error} When the input fails validation
 * @example
 * ```typescript
 * try {
 *   const pin = getPincode("123456");
 *   console.log(`Valid PIN: ${pin}`);
 * } catch (error) {
 *   console.error("Validation failed:", error.message);
 * }
 * ```
 */
export function getPincode(value: unknown): Pincode {
  return pincode().parse(value);
}
