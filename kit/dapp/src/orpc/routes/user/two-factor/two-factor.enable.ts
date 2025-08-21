/**
 * Two-factor authentication setup endpoint.
 *
 * ARCHITECTURE: Inlines Portal GraphQL mutations to reduce abstraction layers and improve
 * error handling integration. Previously used shared query functions, but direct integration
 * provides better control over ORPC error types and request flow tracing.
 */

import { user } from "@/lib/db/schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { metadata } from "@atk/config/metadata";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { eq } from "drizzle-orm/sql";

/**
 * Portal GraphQL mutation for creating wallet verification with TOTP configuration.
 *
 * SECURITY: Creates cryptographically secure OTP setup following RFC 6238 TOTP standard.
 * Portal generates unique verification ID and TOTP URI with proper entropy.
 *
 * DESIGN: Inlined mutation keeps GraphQL schema co-located with usage, improving
 * maintainability and reducing cognitive overhead of tracking shared definitions.
 */
const CREATE_WALLET_VERIFICATION_MUTATION = portalGraphql(`
  mutation EnableTwoFactor(
    $address: String!,
    $algorithm: OTPAlgorithm!,
    $digits: Int!,
    $period: Int!,
    $issuer: String!
  ) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {
        otp: {
          name: "OTP",
          algorithm: $algorithm,
          digits: $digits,
          period: $period,
          issuer: $issuer
        }
      }
    ) {
      id
      name
      parameters
      verificationType
      parameters
    }
  }
`);

type OTPAlgorithm = VariablesOf<
  typeof CREATE_WALLET_VERIFICATION_MUTATION
>["algorithm"];

// SECURITY: Standard TOTP configuration following RFC 6238 and industry best practices
const OTP_DIGITS = 6; // Standard 6-digit codes balance security vs usability
const OTP_PERIOD = 30; // 30-second validity window - standard for most authenticator apps
const OTP_ALGORITHM = "SHA256"; // SHA256 provides stronger security than SHA1 while maintaining compatibility

/**
 * Enables two-factor authentication by creating Portal verification and generating TOTP URI.
 *
 * @remarks
 * SECURITY: Multi-step 2FA setup process:
 * - Validates wallet presence (prevents orphaned configurations)
 * - Prevents duplicate enrollments (avoids confusion/security holes)
 * - Creates Portal verification with secure TOTP parameters
 * - Returns QR code URI for authenticator app enrollment
 *
 * BUSINESS LOGIC: Two-phase enablement - setup creates verification ID but keeps 2FA disabled
 * until first successful OTP verification. This prevents partially configured 2FA states.
 *
 * ERROR HANDLING: Uses ORPC typed errors for consistent API responses:
 * - INPUT_VALIDATION_FAILED for missing wallet
 * - CONFLICT for duplicate enrollment attempts
 * - INTERNAL_SERVER_ERROR for Portal API failures
 *
 * @returns TOTP URI for QR code generation and authenticator app setup
 * @throws INPUT_VALIDATION_FAILED when wallet address missing
 * @throws CONFLICT when 2FA already enabled
 * @throws INTERNAL_SERVER_ERROR when Portal verification creation fails
 */
export const enable = authRouter.user.twoFactor.enable
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db }, errors }) {
    // ARCHITECTURE: Inlined from shared queries to improve error handling and reduce abstractions
    // SECURITY: Validate wallet presence - prevents 2FA setup for incomplete user accounts
    if (!auth.user.wallet) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Wallet address is not set",
        data: { errors: ["Wallet address is not set"] },
      });
    }
    // BUSINESS LOGIC: Prevent duplicate 2FA enrollment to avoid user confusion and security gaps
    if (auth.user.twoFactorEnabled && auth.user.twoFactorVerificationId) {
      throw errors.CONFLICT({
        message: "Two-factor verification already enabled",
      });
    }

    // PERF: Single Portal API call to create secure TOTP configuration
    // Portal handles entropy generation and cryptographic key creation
    const result = await portalClient.request(
      CREATE_WALLET_VERIFICATION_MUTATION,
      {
        address: auth.user.wallet,
        algorithm: OTP_ALGORITHM as OTPAlgorithm,
        digits: OTP_DIGITS,
        period: OTP_PERIOD,
        issuer: metadata.title, // Brand TOTP entries in authenticator apps
      }
    );

    // SECURITY: Extract TOTP URI from Portal response - contains secret key for authenticator apps
    const parameters = result.createWalletVerification?.parameters as {
      uri?: string;
    };
    // ERROR HANDLING: Fail fast if Portal doesn't return verification ID
    if (!result.createWalletVerification?.id) {
      throw errors.INTERNAL_SERVER_ERROR({
        message:
          "Failed to create wallet verification, no verification ID returned",
      });
    }

    const totpURI = parameters.uri ?? "";
    const verificationId = result.createWalletVerification.id;

    // BUSINESS LOGIC: Two-phase 2FA activation - store verification ID but keep disabled until first OTP
    // WHY: Prevents incomplete 2FA states where users have QR codes but verification isn't tested
    await db
      .update(user)
      .set({
        twoFactorEnabled: false, // Set to true when first OTP is verified
        twoFactorVerificationId: verificationId,
      })
      .where(eq(user.id, auth.user.id));

    return {
      totpURI,
    };
  });
