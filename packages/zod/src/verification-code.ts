/**
 * Verification Code Validation Utilities
 *
 * This module provides Zod schemas for validating 8-character verification codes,
 * commonly used for email verification, account confirmation, and similar
 * authentication workflows requiring secure, human-readable codes.
 * @module VerificationCodeValidation
 */
import * as z from "zod";

/**
 * Creates a Zod schema that validates 8-character alphanumeric verification codes.
 * @remarks
 * Verification code format:
 * - Exactly 8 characters long
 * - Uppercase letters (A-Z) and digits (0-9) only
 * - No lowercase, spaces, or special characters
 * - Designed to be easily typed and communicated
 *
 * Common use cases:
 * - Email address verification
 * - Account activation codes
 * - Password reset codes
 * - Transaction confirmation codes
 * @returns A Zod schema for verification code validation
 * @example
 * ```typescript
 * const schema = verificationCode();
 *
 * // Valid verification codes
 * schema.parse("ABC12345");  // Mixed letters and numbers
 * schema.parse("12345678");  // All numbers
 * schema.parse("ABCDEFGH");  // All letters
 * schema.parse("A1B2C3D4");  // Alternating pattern
 *
 * // Invalid codes
 * schema.parse("ABC1234");   // Throws - too short (7 chars)
 * schema.parse("ABC123456"); // Throws - too long (9 chars)
 * schema.parse("abc12345");  // Throws - lowercase letters
 * schema.parse("ABC-1234");  // Throws - contains hyphen
 * ```
 */
export const verificationCode = z
  .string()
  .length(8, "Verification code must be exactly 8 characters")
  .regex(
    /^[A-Z0-9]{8}$/,
    "Verification code must contain only uppercase letters (A-Z) and numbers (0-9)"
  )
  .describe("Verification code");

/**
 * Type representing a validated 8-character verification code.
 * Ensures type safety in verification flows.
 */
export type VerificationCode = z.infer<typeof verificationCode>;

/**
 * Type guard to check if a value is a valid verification code.
 * @param value - The value to check
 * @returns `true` if the value is a valid verification code, `false` otherwise
 * @example
 * ```typescript
 * const code: unknown = "ABC12345";
 * if (isVerificationCode(code)) {
 *   // TypeScript knows code is VerificationCode
 *   console.log("Valid verification code");
 *   verifyEmailAddress(email, code);
 * } else {
 *   console.error("Invalid verification code format");
 * }
 *
 * // Check user input
 * if (isVerificationCode(userInput)) {
 *   processVerification(userId, userInput);
 * }
 * ```
 */
export function isVerificationCode(value: unknown): value is VerificationCode {
  return verificationCode.safeParse(value).success;
}

/**
 * Safely parse and return a verification code or throw an error.
 * @param value - The value to parse as a verification code
 * @returns The validated verification code
 * @throws {Error} If the value is not a valid verification code
 * @example
 * ```typescript
 * try {
 *   const code = getVerificationCode("ABC12345"); // Returns "ABC12345"
 *   const invalid = getVerificationCode("invalid"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid verification code provided");
 *   showError("Please enter a valid 8-character code");
 * }
 *
 * // Email verification flow
 * const verifyCode = getVerificationCode(request.code);
 * const verified = await verifyEmail(email, verifyCode);
 *
 * // Account activation
 * const activationCode = getVerificationCode(params.code);
 * activateAccount(userId, activationCode);
 * ```
 */
export function getVerificationCode(value: unknown): VerificationCode {
  return verificationCode.parse(value);
}
