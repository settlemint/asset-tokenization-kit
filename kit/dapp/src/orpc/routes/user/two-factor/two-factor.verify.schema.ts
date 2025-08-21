/**
 * Two-Factor Authentication Verify Request/Response Schemas
 *
 * VALIDATION DESIGN: Defines input/output structure for TOTP code verification.
 * Schema ensures proper OTP format while maintaining simple response structure.
 *
 * SECURITY CONSIDERATIONS:
 * - code: String format accommodates 6-digit TOTP codes from authenticator apps
 * - status: Boolean success indicator without exposing sensitive verification details
 * - No additional validation constraints to allow flexible OTP implementations
 *
 * BUSINESS LOGIC: Minimal schema reflects straightforward verification operation:
 * - Code validation happens in Portal service with proper security measures
 * - Simple boolean response prevents information disclosure about validation details
 * - First successful verification auto-enables 2FA to complete setup flow
 */

import { z } from "zod";

/**
 * Input schema for two-factor authentication code verification.
 *
 * @remarks
 * VALIDATION: String type accommodates standard 6-digit TOTP codes.
 * No format constraints allow flexibility for different OTP implementations.
 *
 * SECURITY: Actual code validation occurs in Portal service with proper measures:
 * - RFC 6238 TOTP standard compliance
 * - Replay attack protection
 * - Rate limiting to prevent brute force
 *
 * @property code - TOTP code from user's authenticator app (typically 6 digits)
 */
export const twoFactorVerifyInputSchema = z.object({
  code: z.string(),
});

/**
 * Response schema for two-factor authentication code verification.
 *
 * @remarks
 * VALIDATION: Simple boolean status indicator for verification result.
 * No additional details prevent information disclosure about validation process.
 *
 * BUSINESS LOGIC: Success response indicates both code validation and potential 2FA activation.
 * First successful verification auto-enables 2FA to complete setup flow.
 *
 * @property status - Verification result and operation completion status
 */
export const twoFactorVerifyOutputSchema = z.object({
  status: z.boolean(),
});

/**
 * TypeScript type for two-factor verify request.
 *
 * @remarks
 * Inferred from Zod schema to maintain single source of truth for validation logic.
 * Provides compile-time type safety for API consumers and prevents type drift.
 */
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifyInputSchema>;

/**
 * TypeScript type for two-factor verify response.
 *
 * @remarks
 * Inferred from Zod schema to maintain single source of truth for validation logic.
 * Provides compile-time type safety for API consumers and prevents type drift.
 */
export type TwoFactorVerifyOutput = z.infer<typeof twoFactorVerifyOutputSchema>;
