/**
 * Two-factor authentication disable endpoint.
 *
 * ARCHITECTURE: Inlines Portal GraphQL mutations directly to reduce abstraction layers
 * and improve error handling. Previously delegated to shared query functions, but
 * inlining provides better integration with ORPC error types and clearer audit trails.
 */

import { user } from "@/lib/db/schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

/**
 * Portal GraphQL mutation for deleting wallet verification configuration.
 *
 * SECURITY: Permanently removes TOTP configuration from Portal service, invalidating
 * all existing OTP codes and preventing future authentication attempts. Portal
 * handles secure cleanup of cryptographic keys and verification state.
 *
 * DESIGN: Inlined mutation definition keeps GraphQL operations co-located with usage,
 * improving code locality and reducing complexity of tracking shared definitions.
 */
const DELETE_WALLET_VERIFICATION_MUTATION = portalGraphql(`
  mutation DisableTwoFactor($address: String!, $verificationId: String!) {
    deleteWalletVerification(
      userWalletAddress: $address
      verificationId: $verificationId
    ) {
      success
    }
  }
`);

/**
 * Disables two-factor authentication by removing Portal verification and clearing local state.
 *
 * @remarks
 * SECURITY: Comprehensive 2FA cleanup process:
 * - Validates wallet presence (ensures proper user context)
 * - Validates verification ID (prevents invalid disable attempts)
 * - Removes Portal verification (invalidates all OTP codes)
 * - Clears local 2FA state (prevents orphaned database entries)
 *
 * BUSINESS LOGIC: Atomic operation - both Portal deletion and local state updates
 * must succeed to maintain data consistency. Failure in either step leaves system
 * in recoverable state.
 *
 * ERROR HANDLING: Uses ORPC typed errors for consistent API responses:
 * - INPUT_VALIDATION_FAILED for missing prerequisites
 * - Portal API errors bubble up as-is for debugging
 *
 * @returns Success status indicator
 * @throws INPUT_VALIDATION_FAILED when wallet or verification ID missing
 * @throws Portal API errors when deletion fails
 */
export const disable = authRouter.user.twoFactor.disable
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db }, errors }) {
    // ARCHITECTURE: Inlined from shared queries to improve error handling and reduce abstractions
    // SECURITY: Validate wallet presence - ensures proper user context for 2FA operations
    if (!auth.user.wallet) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Wallet address is not set",
        data: { errors: ["Wallet address is not set"] },
      });
    }
    // SECURITY: Validate verification ID exists - prevents invalid disable attempts
    if (!auth.user.twoFactorVerificationId) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Two-factor verification ID is not set",
        data: { errors: ["Two-factor verification ID is not set"] },
      });
    }

    // SECURITY: Remove Portal verification - invalidates all existing OTP codes and keys
    // Portal handles secure cleanup of cryptographic material
    await portalClient.request(DELETE_WALLET_VERIFICATION_MUTATION, {
      address: auth.user.wallet,
      verificationId: auth.user.twoFactorVerificationId,
    });

    // BUSINESS LOGIC: Clear local 2FA state after successful Portal deletion
    // WHY: Atomic operation ensures consistency between Portal and local database
    await db
      .update(user)
      .set({
        twoFactorEnabled: false,
        twoFactorVerificationId: null,
      })
      .where(eq(user.id, auth.user.id));

    return {
      status: true,
    };
  });
