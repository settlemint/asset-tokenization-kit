/**
 * Secret Code Validation Utilities
 *
 * This module provides Zod schemas for validating secret authentication codes,
 * commonly used for API keys, recovery codes, and secure tokens in authentication
 * systems. Ensures appropriate length for security without being impractical.
 * @module SecretCodeValidation
 */
import * as z from "zod";

/**
 * Creates a Zod schema that validates secret authentication codes.
 * @remarks
 * Security requirements:
 * - Minimum 8 characters: Basic security threshold
 * - Maximum 64 characters: Practical limit for usability
 * - No format restrictions: Allows alphanumeric and special characters
 * - Suitable for: API keys, recovery codes, authentication tokens
 *
 * Common use cases:
 * - API authentication tokens
 * - Account recovery codes
 * - Two-factor backup codes
 * - Webhook signing secrets
 * @returns A Zod schema for secret code validation
 * @example
 * ```typescript
 * const schema = secretCode();
 *
 * // Valid secret codes
 * schema.parse("12345678");                  // 8 chars - minimum
 * schema.parse("MySecretKey123!");           // Mixed case with special
 * schema.parse("a1b2c3d4e5f6g7h8i9j0");     // 20 chars alphanumeric
 * schema.parse("very-long-secret-key-for-api-authentication"); // Long key
 *
 * // Invalid secret codes
 * schema.parse("1234567");  // Throws - too short (7 chars)
 * schema.parse("a".repeat(65)); // Throws - too long (65 chars)
 * ```
 */
export const secretCode = () =>
  z
    .string()
    .min(8, "Secret code must be at least 8 characters long")
    .max(64, "Secret code must not exceed 64 characters")
    .describe("Secret authentication code");

/**
 * Type representing a validated secret authentication code.
 * Ensures type safety in security-sensitive contexts.
 */
export type SecretCode = z.infer<ReturnType<typeof secretCode>>;

/**
 * Type guard to check if a value is a valid secret code.
 * @param value - The value to check
 * @returns `true` if the value is a valid secret code, `false` otherwise
 * @example
 * ```typescript
 * const apiKey: unknown = process.env.API_KEY;
 * if (isSecretCode(apiKey)) {
 *   // TypeScript knows apiKey is SecretCode
 *   console.log("Valid API key loaded");
 *   initializeAPI(apiKey);
 * } else {
 *   console.error("Invalid or missing API key");
 * }
 *
 * // Validate webhook secrets
 * if (isSecretCode(webhookSecret)) {
 *   verifyWebhookSignature(payload, signature, webhookSecret);
 * }
 * ```
 */
export function isSecretCode(value: unknown): value is SecretCode {
  return secretCode().safeParse(value).success;
}

/**
 * Safely parse and return a secret code or throw an error.
 * @param value - The value to parse as a secret code
 * @returns The validated secret code
 * @throws {Error} If the value is not a valid secret code
 * @example
 * ```typescript
 * try {
 *   const apiSecret = getSecretCode(config.apiSecret);
 *   // Use validated secret
 *   authenticateAPI(apiSecret);
 * } catch (error) {
 *   console.error("Invalid secret code format");
 *   process.exit(1);
 * }
 *
 * // Validate recovery codes
 * const recoveryCode = getSecretCode(userInput);
 * validateRecoveryCode(userId, recoveryCode);
 * ```
 */
export function getSecretCode(value: unknown): SecretCode {
  return secretCode().parse(value);
}
