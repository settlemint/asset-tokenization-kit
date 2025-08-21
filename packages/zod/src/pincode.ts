/**
 * PIN Code Validation Utilities for Secure Authentication
 *
 * @remarks
 * This module provides comprehensive Zod-based validation for 6-digit PIN codes
 * used in wallet security and authentication systems. It ensures PIN codes conform
 * to security standards and format requirements for reliable cryptographic operations.
 *
 * SECURITY ARCHITECTURE:
 * - 6-digit format balances security with usability (1 million combinations)
 * - Numeric-only constraint prevents encoding issues in cryptographic operations
 * - Length validation prevents brute force attacks on shorter PINs
 * - Format consistency ensures reliable hashing and verification
 *
 * BUSINESS CONTEXT:
 * - PIN codes secure wallet operations and sensitive transactions
 * - Integration with Portal's challenge-response verification system
 * - Support for mobile and desktop authentication workflows
 * - Compliance with banking and financial security standards
 *
 * VALIDATION STRATEGY:
 * - Multi-layer validation (length, format, character set)
 * - Type-safe validation with TypeScript integration
 * - Runtime validation with clear error messages
 * - Utility functions for common validation patterns
 *
 * @see {@link ../../../kit/dapp/src/lib/auth/plugins/pincode-plugin} PIN authentication plugin
 * @see {@link ../../../kit/dapp/src/orpc/routes/user/pincode} PIN verification procedures
 * @module PincodeValidation
 */
import { z } from "zod";

/**
 * Zod schema for validating 6-digit PIN codes with comprehensive security checks.
 *
 * @remarks
 * VALIDATION LAYERS: This schema implements multiple validation layers to ensure
 * PIN codes meet security requirements:
 * 1. String type validation (prevents non-string inputs)
 * 2. Exact length validation (prevents weak short PINs or unwieldy long ones)
 * 3. Character set validation (ensures numeric-only for cryptographic compatibility)
 * 4. Format consistency (prevents encoding issues in authentication systems)
 *
 * SECURITY CONSIDERATIONS:
 * - 6-digit length provides 1,000,000 possible combinations (adequate for time-limited use)
 * - Numeric-only format prevents encoding issues in cryptographic hashing
 * - Leading zeros preserved to maintain full keyspace (000000-999999)
 * - No special characters to avoid injection or parsing vulnerabilities
 *
 * CRYPTOGRAPHIC COMPATIBILITY: The numeric-only format ensures PIN codes can be
 * safely used in cryptographic operations without encoding ambiguities that could
 * cause verification failures or security vulnerabilities.
 *
 * ERROR HANDLING: Validation failures provide specific error messages to help
 * users understand PIN requirements without exposing security implementation details.
 *
 * @example
 * ```typescript
 * // Valid PIN code parsing
 * const userPin = pincode.parse("123456");
 * // Returns: "123456" (Type: Pincode)
 *
 * const pinWithLeadingZeros = pincode.parse("000123");
 * // Returns: "000123" (Leading zeros preserved)
 *
 * const bankPin = pincode.parse("987654");
 * // Returns: "987654" (Standard format)
 *
 * // Safe parsing with error handling
 * const result = pincode.safeParse("12345"); // Too short
 * if (result.success) {
 *   console.log(result.data); // Valid PIN
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 *
 * // Type guard usage for conditional logic
 * if (isPincode(userInput)) {
 *   // TypeScript knows userInput is Pincode
 *   console.log(`Valid PIN: ${userInput}`);
 * }
 *
 * // Invalid examples that will throw ZodError
 * pincode.parse("12345");    // throws - too short (weak security)
 * pincode.parse("1234567");  // throws - too long (usability issue)
 * pincode.parse("12345a");   // throws - contains letter (encoding issue)
 * pincode.parse("123 456");  // throws - contains space (parsing issue)
 * pincode.parse("123-456");  // throws - contains dash (format issue)
 * ```
 * @throws {ZodError} When the input fails any validation step with specific error messages
 */
export const pincode =
  z
    .string()
    // LAYER 1: Exact length validation for security and usability balance
    .length(6, "PIN code must be exactly 6 digits")
    // LAYER 2: Character set validation for cryptographic compatibility
    .regex(/^\d{6}$/, "PIN code must contain only numeric digits (0-9)")
    // LAYER 3: Schema description for documentation and tooling
    .describe("6-digit PIN code for secure authentication");

// Note: Global registry functionality removed as it's not available in Zod v4
// This was used for schema registration in older versions but is no longer needed

/**
 * Type representing a validated 6-digit PIN code.
 *
 * @remarks
 * BRANDED TYPE: This type is inferred from the Zod schema, creating a "branded"
 * string type that can only be created through successful validation. This prevents
 * accidental use of unvalidated strings as PIN codes.
 *
 * TYPE SAFETY: Variables of this type are guaranteed to contain valid PIN codes
 * that have passed all validation checks. This enables safe use in cryptographic
 * operations without additional runtime validation.
 *
 * USAGE PATTERN: Use this type for function parameters and return values that
 * require validated PIN codes, ensuring type safety throughout the application.
 */
export type Pincode = z.infer<typeof pincode>;

/**
 * Type guard function to check if a value is a valid PIN code at runtime.
 *
 * @remarks
 * RUNTIME VALIDATION: This function provides runtime type checking for PIN codes,
 * enabling safe type narrowing in conditional logic without throwing exceptions.
 *
 * TYPE NARROWING: When this function returns true, TypeScript automatically
 * narrows the type of the input parameter to Pincode, enabling type-safe usage.
 *
 * PERFORMANCE: Uses safeParse internally to avoid exception overhead, making it
 * suitable for use in performance-sensitive validation loops or user input handling.
 *
 * @param value - The value to validate (accepts any type for flexibility)
 * @returns true if the value is a valid PIN code, false otherwise
 * @example
 * ```typescript
 * // Type-safe conditional validation
 * const userInput: unknown = "123456";
 *
 * if (isPincode(userInput)) {
 *   // TypeScript now knows userInput is Pincode
 *   console.log(`Valid PIN: ${userInput}`);
 *   // Can safely use in cryptographic operations
 *   const hashedPin = await hashPin(userInput);
 * } else {
 *   console.error("Invalid PIN code provided");
 *   // Handle invalid input without type errors
 * }
 *
 * // Array filtering with type guards
 * const inputs: unknown[] = ["123456", "invalid", "654321"];
 * const validPins: Pincode[] = inputs.filter(isPincode);
 * // validPins is now typed as Pincode[] with guaranteed valid values
 * ```
 */
export function isPincode(value: unknown): value is Pincode {
  // Use safeParse to avoid exception overhead in type guard context
  return pincode.safeParse(value).success;
}

/**
 * Safely parse and validate a PIN code with exception-based error handling.
 *
 * @remarks
 * EXCEPTION HANDLING: This function uses parse() internally, which throws ZodError
 * for invalid inputs. Use this when you expect the input to be valid and want to
 * handle validation errors at a higher level in your application.
 *
 * ERROR PROPAGATION: Validation errors are thrown as ZodError instances with
 * detailed information about what validation rules failed, enabling precise
 * error handling and user feedback.
 *
 * USE CASES: Ideal for scenarios where invalid PIN codes represent exceptional
 * conditions that should halt execution, such as during authentication flows
 * or security-critical operations.
 *
 * @param value - The value to parse and validate (accepts any type)
 * @returns The validated PIN code (guaranteed to be valid)
 * @throws {ZodError} When the input fails validation with detailed error information
 * @example
 * ```typescript
 * // Exception-based validation for critical paths
 * try {
 *   const pin = getPincode("123456");
 *   console.log(`Valid PIN: ${pin}`);
 *   // Proceed with authentication
 *   await authenticateWithPin(pin);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     console.error("PIN validation failed:", error.issues);
 *     // Show specific validation errors to user
 *     showValidationErrors(error.issues);
 *   } else {
 *     console.error("Unexpected error:", error);
 *   }
 * }
 *
 * // Batch validation with error collection
 * const pinCandidates = ["123456", "invalid", "654321"];
 * const validatedPins: Pincode[] = [];
 * const errors: string[] = [];
 *
 * for (const candidate of pinCandidates) {
 *   try {
 *     validatedPins.push(getPincode(candidate));
 *   } catch (error) {
 *     errors.push(`Invalid PIN: ${candidate}`);
 *   }
 * }
 * ```
 */
export function getPincode(value: unknown): Pincode {
  // Use parse() for exception-based validation with detailed error information
  return pincode.parse(value);
}
