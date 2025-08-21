/**
 * Two-Factor Authentication API Contract Definitions
 *
 * ARCHITECTURE: Defines ORPC contracts for Time-based One-Time Password (TOTP) system
 * following RFC 6238 standard. Provides cryptographically secure second authentication
 * factor using time-synchronized codes from authenticator apps.
 *
 * SECURITY MODEL:
 * - Enable: Generates TOTP secret and QR code URI for authenticator setup
 * - Verify: Validates OTP codes with replay protection and auto-activates 2FA
 * - Disable: Removes TOTP configuration and clears verification state
 *
 * DESIGN RATIONALE: Three-contract design covers complete TOTP lifecycle:
 * - Separation enables granular access control and clear API boundaries
 * - Input validation prevents malformed requests and security bypasses
 * - Output schemas ensure consistent response structure for client consumption
 *
 * INTEGRATION: Contracts define HTTP methods, paths, and schemas for ORPC route generation
 * with end-to-end type safety from validation to API responses.
 */

import { baseContract } from "@/orpc/procedures/base.contract";
import {
  twoFactorEnableInputSchema,
  twoFactorEnableOutputSchema,
} from "./two-factor.enable.schema";
import {
  twoFactorDisableInputSchema,
  twoFactorDisableOutputSchema,
} from "./two-factor.disable.schema";
import {
  twoFactorVerifyInputSchema,
  twoFactorVerifyOutputSchema,
} from "./two-factor.verify.schema";

/**
 * Contract for enabling two-factor authentication.
 *
 * @remarks
 * SECURITY: POST operation initializes TOTP configuration with cryptographically secure parameters.
 * Portal service generates secret key with sufficient entropy following RFC 6238 standard.
 *
 * BUSINESS LOGIC: Two-phase activation model:
 * - Setup phase: Creates verification but keeps 2FA disabled
 * - Activation phase: Enables 2FA on first successful OTP verification
 * - Prevents incomplete configurations where QR codes exist but 2FA isn't functional
 *
 * DESIGN RATIONALE: Returns TOTP URI for QR code generation enabling easy authenticator setup.
 * Standard otpauth:// URI format compatible with Google Authenticator, Authy, and similar apps.
 *
 * @input Optional password and issuer parameters for enhanced security and branding
 * @returns TOTP URI containing secret key and configuration for authenticator apps
 */
const enable = baseContract
  .route({
    method: "POST",
    path: "/user/two-factor/enable",
    description: "Enable two-factor authentication",
    successDescription: "Two-factor authentication initialized",
    tags: ["user", "security", "2fa"],
  })
  .input(twoFactorEnableInputSchema)
  .output(twoFactorEnableOutputSchema);

/**
 * Contract for disabling two-factor authentication.
 *
 * @remarks
 * SECURITY: POST operation performs comprehensive 2FA cleanup with password verification.
 * Removes Portal verification (invalidates all OTP codes) and clears local state.
 *
 * BUSINESS LOGIC: Atomic operation ensures consistency between Portal and local database.
 * Both Portal deletion and local updates must succeed to maintain data integrity.
 *
 * DESIGN RATIONALE: Requires password verification to prevent unauthorized 2FA removal
 * by attackers with temporary session access. Critical security operation needs additional authentication.
 *
 * @input Requires password for additional security verification
 * @returns Success status indicating complete 2FA removal
 */
const disable = baseContract
  .route({
    method: "POST",
    path: "/user/two-factor/disable",
    description: "Disable two-factor authentication",
    successDescription: "Two-factor authentication disabled",
    tags: ["user", "security", "2fa"],
  })
  .input(twoFactorDisableInputSchema)
  .output(twoFactorDisableOutputSchema);

/**
 * Contract for verifying TOTP codes.
 *
 * @remarks
 * SECURITY: POST operation validates OTP codes against Portal's secure verification service.
 * Portal implements RFC 6238 TOTP standard with replay attack protection and rate limiting.
 *
 * BUSINESS LOGIC: Auto-enables 2FA on first successful verification to complete setup flow.
 * This prevents incomplete states where users have QR codes but 2FA isn't actually active.
 *
 * DESIGN RATIONALE: Single verification endpoint handles both setup completion and
 * ongoing authentication. Simplifies client logic while maintaining security.
 *
 * @input 6-digit TOTP code from user's authenticator app
 * @returns Success status and activation state information
 */
const verify = baseContract
  .route({
    method: "POST",
    path: "/user/two-factor/verify",
    description: "Verify two-factor authentication code",
    successDescription: "Two-factor code verified successfully",
    tags: ["user", "security", "2fa"],
  })
  .input(twoFactorVerifyInputSchema)
  .output(twoFactorVerifyOutputSchema);

/**
 * Two-factor authentication contract definition for ORPC route generation.
 *
 * @remarks
 * ARCHITECTURE: Exports contract objects for type-safe ORPC procedure definitions.
 * Contracts define HTTP methods, paths, input/output schemas, and OpenAPI documentation.
 *
 * SECURITY: Contract validation prevents malformed requests and ensures secure API boundaries.
 * Input schemas validate OTP format, password requirements, and optional parameters.
 *
 * INTEGRATION: Used by ORPC to generate both client SDK and server route handlers
 * with end-to-end type safety from schema definitions to API responses.
 */
export const twoFactorContract = {
  enable,
  disable,
  verify,
};
