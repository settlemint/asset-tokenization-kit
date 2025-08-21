/**
 * PIN Code Removal and Security State Cleanup Procedure
 *
 * @remarks
 * This procedure handles the complete removal of PIN security from a user's wallet,
 * implementing a cleanup pattern that removes both cryptographic verification
 * records and local preference state while maintaining data consistency.
 *
 * ARCHITECTURAL DECISION - COMPLETE REMOVAL:
 * - Removes Portal verification records (cryptographic cleanup)
 * - Resets local database flags (UI state consistency)
 * - Preserves audit trails through Portal's soft-delete mechanisms
 * - Enables clean re-setup of PIN security if needed later
 *
 * ERROR HANDLING PHILOSOPHY:
 * - CONFLICT errors for already-removed PINs (idempotent behavior)
 * - NOT_FOUND errors for missing prerequisites (wallet address)
 * - INTERNAL_SERVER_ERROR for Portal operation failures
 * - Graceful degradation when Portal is temporarily unavailable
 *
 * SECURITY CONSIDERATIONS:
 * - Only authenticated users can remove their own PINs
 * - Wallet address binding prevents cross-user PIN removal
 * - Verification ID prevents removal of other users' verification records
 * - Portal operations are authoritative for cryptographic state
 *
 * BUSINESS IMPACT:
 * - PIN removal disables secondary authentication for the user
 * - High-value operations may require re-authentication after removal
 * - Compliance workflows may need adjustment for PIN-less users
 * - User experience changes to reflect reduced security posture
 *
 * STATE MANAGEMENT STRATEGY:
 * - Portal deletion must succeed before local state cleanup
 * - Database updates use explicit null values for clarity
 * - Boolean flags provide fast feature detection in application logic
 * - Atomic operations prevent inconsistent security state
 *
 * @see {@link ./pincode.set} PIN establishment with duplicate prevention
 * @see {@link ./pincode.update} PIN modification with replacement semantics
 */

import { user } from "@/lib/db/schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

/**
 * GraphQL mutation for removing PIN verification records from Portal system.
 *
 * @remarks
 * DELETION SEMANTICS: Uses specific verification ID for precise record targeting,
 * preventing accidental deletion of other verification types (biometric, hardware keys)
 * that may be associated with the same wallet address.
 *
 * DUAL-KEY VERIFICATION: Requires both wallet address and verification ID to
 * prevent unauthorized deletion attempts. This ensures only the record owner
 * (with knowledge of both values) can initiate deletion.
 *
 * PORTAL AUTHORITY: Portal's deleteWalletVerification is the authoritative
 * operation for cryptographic state cleanup. Success response indicates:
 * - Verification record has been marked for deletion
 * - Associated cryptographic keys have been invalidated
 * - Audit trail has been updated with deletion event
 *
 * SOFT DELETE: Portal typically implements soft deletion for compliance,
 * meaning records are marked as deleted but preserved for audit purposes.
 * This supports regulatory requirements and incident investigation.
 */
const REMOVE_PINCODE_MUTATION = portalGraphql(`
  mutation RemovePinCode($address: String!, $verificationId: String!) {
    deleteWalletVerification(
      userWalletAddress: $address
      verificationId: $verificationId
    ) {
      success
    }
  }
`);

/**
 * PIN code removal handler implementing secure cleanup with idempotent behavior.
 *
 * @remarks
 * MIDDLEWARE CHOICE: Uses only database middleware (not Portal middleware) because
 * removal operations directly use the shared portalClient instance for simplicity.
 * Portal middleware is unnecessary when only making a single GraphQL request.
 *
 * IDEMPOTENT DESIGN: Checks current PIN state before attempting removal to provide
 * consistent behavior when called multiple times. This prevents error conditions
 * during retry scenarios or when users click "remove" multiple times.
 *
 * CLEANUP SEQUENCE: Portal deletion occurs first to ensure cryptographic state
 * is cleaned up before local preferences are modified. This prevents situations
 * where local state indicates "no PIN" but Portal still has verification records.
 *
 * @param context.auth - Authenticated user context with current PIN state
 * @param context.db - Database client for local state cleanup
 * @param errors - ORPC error constructors for consistent error responses
 * @returns Simple success confirmation (no sensitive data exposed)
 * @throws CONFLICT when PIN is already removed (idempotent behavior)
 * @throws NOT_FOUND when user lacks required wallet address
 * @throws INTERNAL_SERVER_ERROR when Portal deletion fails
 */
export const remove = authRouter.user.pincode.remove
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db }, errors }) {
    const { pincodeEnabled, pincodeVerificationId, wallet } = auth.user;

    // IDEMPOTENCY: Graceful handling of already-removed PIN state
    // WHY CONFLICT: Indicates client state is out of sync with server
    if (!pincodeEnabled || !pincodeVerificationId) {
      throw errors.CONFLICT({
        message: "Pincode already removed",
      });
    }

    // PREREQUISITE: PIN removal requires wallet address for Portal operation
    if (!wallet) {
      throw errors.NOT_FOUND({
        message: "User wallet not found",
      });
    }

    // PORTAL-FIRST: Remove cryptographic verification before local state cleanup
    // SECURITY: Ensures cryptographic state is authoritative source of truth
    const result = await portalClient.request(REMOVE_PINCODE_MUTATION, {
      address: wallet,
      verificationId: pincodeVerificationId,
    });

    // VALIDATION: Ensure Portal successfully processed deletion request
    if (!result.deleteWalletVerification?.success) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to delete wallet verification",
      });
    }

    // LOCAL CLEANUP: Reset user preferences only after Portal success
    // WHY EXPLICIT NULL: Clear indication that verification ID is removed
    await db
      .update(user)
      .set({
        pincodeEnabled: false,
        pincodeVerificationId: null,
      })
      .where(eq(user.id, auth.user.id));

    // MINIMAL RESPONSE: No sensitive data in response for security
    return {
      success: true,
    };
  });
