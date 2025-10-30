/**
 * Two-Factor Authentication Code Validation Utilities
 *
 * This module provides Zod schemas for validating 6-digit two-factor authentication (2FA)
 * codes, commonly used in time-based one-time password (TOTP) systems like Google
 * Authenticator, Authy, and similar security applications.
 * @module TwoFactorCodeValidation
 */
import { z } from "zod";

/**
 * Creates a Zod schema that validates 6-digit two-factor authentication codes.
 * @remarks
 * 2FA code requirements:
 * - Exactly 6 digits (standard TOTP length)
 * - Numeric only (0-9)
 * - No spaces or special characters
 * - Leading zeros preserved (e.g., "000123")
 *
 * Compatible with:
 * - Google Authenticator
 * - Microsoft Authenticator
 * - Authy
 * - Most TOTP-based 2FA systems
 * @returns A Zod schema for 2FA code validation
 * @example
 * ```typescript
 * const schema = twoFactorCode();
 *
 * // Valid 2FA codes
 * schema.parse("123456"); // Standard code
 * schema.parse("000001"); // With leading zeros
 * schema.parse("999999"); // Maximum value
 *
 * // Invalid codes
 * schema.parse("12345");   // Throws - too short
 * schema.parse("1234567"); // Throws - too long
 * schema.parse("12345a");  // Throws - contains letter
 * schema.parse("123 456"); // Throws - contains space
 * ```
 */
export const twoFactorCode = () =>
  z
    .string()
    .length(6, "Two-factor code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Two-factor code must contain only numeric digits (0-9)")
    .describe("Two-factor authentication code");

/**
 * Type representing a validated 6-digit 2FA code.
 * Ensures type safety in authentication flows.
 */
export type TwoFactorCode = z.infer<ReturnType<typeof twoFactorCode>>;

/**
 * Type guard to check if a value is a valid two-factor code.
 * @param value - The value to check
 * @returns `true` if the value is a valid 2FA code, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "123456";
 * if (isTwoFactorCode(userInput)) {
 *   // TypeScript knows userInput is TwoFactorCode
 *   console.log("Valid 2FA code entered");
 *   verifyTwoFactorAuth(userId, userInput);
 * } else {
 *   console.error("Invalid 2FA code format");
 * }
 *
 * // Validation in auth flow
 * if (isTwoFactorCode(authCode)) {
 *   const isValid = await validateTOTP(user.secret, authCode);
 * }
 * ```
 */
export function isTwoFactorCode(value: unknown): value is TwoFactorCode {
  return twoFactorCode().safeParse(value).success;
}

/**
 * Safely parse and return a two-factor code or throw an error.
 * @param value - The value to parse as a 2FA code
 * @returns The validated 2FA code
 * @throws {Error} If the value is not a valid 2FA code
 * @example
 * ```typescript
 * try {
 *   const code = getTwoFactorCode("123456"); // Returns "123456"
 *   const invalid = getTwoFactorCode("abc123"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid 2FA code provided");
 * }
 *
 * // Use in authentication
 * const twoFACode = getTwoFactorCode(request.code);
 * const authenticated = await verifyTOTP(user.secret, twoFACode);
 *
 * // Login flow
 * const code = getTwoFactorCode(formData.twoFactorCode);
 * completeLogin(username, password, code);
 * ```
 */
export function getTwoFactorCode(value: unknown): TwoFactorCode {
  return twoFactorCode().parse(value);
}
