/**
 * Two-factor authentication OTP verification endpoint.
 *
 * ARCHITECTURE: Inlines Portal GraphQL mutations directly in route handler to reduce abstraction
 * layers and improve code locality. Previously delegated to shared query functions, but inlining
 * provides better error handling integration with ORPC error types and clearer request flow.
 */

import { user } from "@/lib/db/schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

/**
 * Portal GraphQL mutation for OTP validation.
 *
 * SECURITY: Validates OTP against Portal's secure verification service which implements
 * TOTP RFC 6238 with replay attack protection. The Portal service maintains OTP state
 * and enforces rate limiting to prevent brute force attacks.
 *
 * DESIGN: Inlined mutation definition keeps GraphQL schema co-located with usage,
 * improving maintainability compared to centralized query files.
 */
const VERIFY_WALLET_VERIFICATION_CHALLENGE_MUTATION = portalGraphql(`
  mutation VerifyTwoFactorOTP($address: String!, $verificationId: String!, $otp: String!) {
    validateOtpConfiguration(
      userWalletAddress: $address
      verificationId: $verificationId
      otpCode: $otp
    ) {
      valid
    }
  }
`);

/**
 * Verifies a two-factor authentication OTP code and enables 2FA on first successful verification.
 *
 * @remarks
 * SECURITY: Implements defense-in-depth with multiple validation layers:
 * - Wallet address presence (prevents orphaned verification attempts)
 * - Verification ID presence (ensures proper 2FA setup flow)
 * - Portal OTP validation (cryptographic verification with replay protection)
 *
 * BUSINESS LOGIC: Auto-enables 2FA on first successful verification to complete setup flow.
 * This prevents incomplete 2FA states where users have QR codes but 2FA isn't active.
 *
 * ERROR HANDLING: Uses ORPC typed errors for consistent API responses:
 * - INPUT_VALIDATION_FAILED for missing prerequisites
 * - UNAUTHORIZED for invalid OTP codes
 *
 * @param input.code - 6-digit TOTP code from authenticator app
 * @returns Success status indicator
 * @throws INPUT_VALIDATION_FAILED when wallet or verification ID missing
 * @throws UNAUTHORIZED when OTP validation fails
 */
export const verify = authRouter.user.twoFactor.verify
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db }, input, errors }) {
    // ARCHITECTURE: Inlined from shared queries to reduce abstraction and improve error handling
    // SECURITY: Validate wallet presence - prevents verification attempts for incomplete user setups
    if (!auth.user.wallet) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Wallet address is not set",
        data: { errors: ["Wallet address is not set"] },
      });
    }
    // SECURITY: Ensure verification ID exists - prevents OTP validation without proper 2FA enrollment
    if (!auth.user.twoFactorVerificationId) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Two-factor verification ID is not set",
        data: { errors: ["Two-factor verification ID is not set"] },
      });
    }

    // PERF: Single Portal API call for OTP validation - Portal handles rate limiting and replay protection
    const result = await portalClient.request(
      VERIFY_WALLET_VERIFICATION_CHALLENGE_MUTATION,
      {
        address: auth.user.wallet,
        verificationId: auth.user.twoFactorVerificationId,
        otp: input.code,
      }
    );

    // SECURITY: Default to false for undefined responses - fail-secure approach
    const verified = result.validateOtpConfiguration?.valid ?? false;

    if (!verified) {
      // SECURITY: Return generic error message to prevent OTP enumeration attacks
      throw errors.UNAUTHORIZED({
        message: "Invalid two factor code",
      });
    }

    // BUSINESS LOGIC: Auto-enable 2FA on first successful verification to complete setup flow
    // WHY: Prevents incomplete states where users have QR codes but 2FA isn't actually active
    if (!auth.user.twoFactorEnabled) {
      await db
        .update(user)
        .set({
          twoFactorEnabled: true,
        })
        .where(eq(user.id, auth.user.id));
    }

    return {
      status: true,
    };
  });
