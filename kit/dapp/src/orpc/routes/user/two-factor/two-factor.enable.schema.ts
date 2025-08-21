/**
 * Two-Factor Authentication Enable Request/Response Schemas
 *
 * VALIDATION DESIGN: Defines input/output structure for TOTP 2FA initialization.
 * Schema enables flexible configuration while maintaining security requirements.
 *
 * SECURITY CONSIDERATIONS:
 * - password: Optional field for enhanced security (future password validation)
 * - issuer: Optional branding for authenticator app entries (defaults to app title)
 * - totpURI: Contains TOTP secret key and configuration for QR code generation
 *
 * BUSINESS LOGIC: Input schema supports optional parameters for flexibility:
 * - Password validation may be required based on user security settings
 * - Issuer branding improves user experience in authenticator apps
 * - Simple output provides everything needed for authenticator setup
 */

import { z } from "zod";

/**
 * Input schema for two-factor authentication enablement.
 *
 * @remarks
 * VALIDATION: Optional password field supports future enhanced security requirements.
 * Currently not enforced but enables password validation for high-security accounts.
 *
 * BUSINESS LOGIC: Optional issuer field allows custom branding in authenticator apps.
 * Defaults to application title when not provided.
 *
 * @property password - Optional password for enhanced security verification
 * @property issuer - Optional issuer name for authenticator app branding
 */
export const twoFactorEnableInputSchema = z.object({
  password: z.string().optional(),
  issuer: z.string().optional(),
});

/**
 * Response schema for two-factor authentication enablement.
 *
 * @remarks
 * SECURITY: Contains TOTP URI with embedded secret key for authenticator setup.
 * URI follows otpauth:// standard format compatible with major authenticator apps.
 *
 * USAGE: Client generates QR code from URI for easy authenticator app enrollment.
 * URI contains all necessary TOTP parameters (secret, algorithm, digits, period).
 *
 * @property totpURI - TOTP URI containing secret and configuration for authenticator setup
 */
export const twoFactorEnableOutputSchema = z.object({
  totpURI: z.string(),
});

/**
 * TypeScript type for two-factor enable request.
 *
 * @remarks
 * Inferred from Zod schema to maintain single source of truth for validation logic.
 * Provides compile-time type safety for API consumers and prevents type drift.
 */
export type TwoFactorEnableInput = z.infer<typeof twoFactorEnableInputSchema>;

/**
 * TypeScript type for two-factor enable response.
 *
 * @remarks
 * Inferred from Zod schema to maintain single source of truth for validation logic.
 * Provides compile-time type safety for API consumers and prevents type drift.
 */
export type TwoFactorEnableOutput = z.infer<typeof twoFactorEnableOutputSchema>;
