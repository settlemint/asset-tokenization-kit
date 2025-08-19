/**
 * Verification Type Validation Utilities
 *
 * This module provides Zod schemas for validating verification method types,
 * used to categorize different identity verification channels in KYC/AML
 * processes and multi-factor authentication systems.
 * @module VerificationTypeValidation
 */
import { z } from "zod";

/**
 * Available verification method types.
 * @remarks
 * Different channels for identity verification:
 * - `email`: Email address verification via confirmation link or code
 * - `phone`: Phone number verification via SMS or voice call
 * - `identity`: Identity document verification (passport, ID card, etc.)
 */
export const verificationTypes = ["OTP", "PINCODE", "SECRET_CODES"] as const;

/**
 * Enum-like object for verification types with camelCase keys.
 * Use this instead of hardcoded strings for type safety.
 * @example
 * ```typescript
 * if (user.verificationTypes.includes(VerificationType.otp)) {
 *   // User has 2FA enabled
 * }
 * ```
 */
export const VerificationType = {
  otp: "OTP",
  pincode: "PINCODE",
  secretCodes: "SECRET_CODES",
} as const satisfies Record<string, (typeof verificationTypes)[number]>;

/**
 * Creates a Zod schema that validates verification types.
 * @returns A Zod enum schema for verification type validation
 * @example
 * ```typescript
 * const schema = verificationType();
 *
 * // Valid verification types
 * schema.parse("email");    // Email verification
 * schema.parse("phone");    // Phone/SMS verification
 * schema.parse("identity"); // Document verification
 *
 * // Invalid type
 * schema.parse("biometric"); // Throws ZodError
 * ```
 */
export const verificationType = z.enum(verificationTypes).describe("Type of verification");

/**
 * Type representing a validated verification method type.
 * Ensures type safety.
 */
export type VerificationType = z.infer<typeof verificationType>;

/**
 * Type guard to check if a value is a valid verification type.
 * @param value - The value to check
 * @returns `true` if the value is a valid verification type, `false` otherwise
 * @example
 * ```typescript
 * const method: unknown = "email";
 * if (isVerificationType(method)) {
 *   // TypeScript knows method is VerificationType
 *   console.log(`Using ${method} verification`);
 *
 *   // Apply method-specific logic
 *   switch (method) {
 *     case "email":
 *       sendVerificationEmail();
 *       break;
 *     case "phone":
 *       sendSMSCode();
 *       break;
 *     case "identity":
 *       startDocumentUpload();
 *       break;
 *   }
 * }
 * ```
 */
export function isVerificationType(value: unknown): value is VerificationType {
  return verificationType.safeParse(value).success;
}

/**
 * Safely parse and return a verification type or throw an error.
 * @param value - The value to parse as a verification type
 * @returns The validated verification type
 * @throws {Error} If the value is not a valid verification type
 * @example
 * ```typescript
 * try {
 *   const method = getVerificationType("phone"); // Returns "phone"
 *   const invalid = getVerificationType("facial"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid verification type");
 *   // Default to email verification
 *   initiateVerification("email");
 * }
 *
 * // KYC flow
 * const verifyMethod = getVerificationType(request.method);
 * startVerificationProcess(userId, verifyMethod);
 *
 * // Multi-factor setup
 * const mfaType = getVerificationType(userPreference);
 * configureMFA(account, mfaType);
 * ```
 */
export function getVerificationType(value: unknown): VerificationType {
  return verificationType.parse(value);
}
