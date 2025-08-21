/**
 * PIN Code Initial Setup Procedure
 *
 * @remarks
 * This procedure handles the initial establishment of a PIN code for wallet security,
 * implementing a dual-write pattern to maintain consistency between the Portal
 * verification system and local user preferences.
 *
 * SECURITY ARCHITECTURE:
 * - Portal GraphQL API handles cryptographic operations (hashing, salting, storage)
 * - Local database tracks user preferences and feature enablement state
 * - Atomic transactions ensure consistent state across both systems
 * - Verification IDs provide secure linkage without exposing PIN structure
 *
 * BUSINESS LOGIC CONSTRAINTS:
 * - One PIN per user (enforced via conflict detection)
 * - Requires active wallet address (PIN is tied to specific wallet)
 * - Portal verification must succeed before local state updates
 * - Idempotent failure behavior for network resilience
 *
 * ERROR HANDLING STRATEGY:
 * - CONFLICT: User already has PIN enabled (prevents duplicate setup)
 * - NOT_FOUND: User lacks wallet address (prerequisite for PIN security)
 * - INTERNAL_SERVER_ERROR: Portal verification creation failed (external dependency)
 * - Database rollback on any failure to prevent inconsistent security state
 *
 * @see {@link @/lib/settlemint/portal} Portal GraphQL client for cryptographic operations
 * @see {@link @/lib/db/schema} User schema for PIN preference storage
 */

import { user } from "@/lib/db/schema";
import { portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

/**
 * GraphQL mutation for creating PIN verification in Portal system.
 *
 * @remarks
 * WHY PORTAL: Portal handles cryptographic operations (hashing, salting, secure storage)
 * that are beyond the scope of the application layer. This separation ensures
 * PIN security follows cryptographic best practices without exposing implementation.
 *
 * MUTATION DESIGN: Creates a wallet verification record with specific structure:
 * - userWalletAddress: Links PIN to specific wallet (prevents cross-wallet attacks)
 * - verificationInfo.pincode: Structured data for PIN type identification
 * - name: "PINCODE" constant for verification type classification
 * - pincode: Raw PIN value (will be hashed/salted by Portal)
 *
 * RETURN FIELDS: Only ID is used for local state linkage; other fields provide
 * audit trail and verification type confirmation for Portal operations.
 */
const SET_PINCODE_MUTATION = portalGraphql(`
  mutation SetPinCode($address: String!, $pincode: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {pincode: {name: "PINCODE", pincode: $pincode}}
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

/**
 * PIN code establishment handler with dual-write consistency pattern.
 *
 * @remarks
 * MIDDLEWARE COMPOSITION: Inherits authentication from authRouter, adds database
 * and Portal client access for cross-system operations.
 *
 * CONSISTENCY PATTERN: Portal-first writes ensure cryptographic storage succeeds
 * before local state updates, preventing orphaned local state if Portal fails.
 *
 * @param context.auth - Authenticated user context with current PIN state
 * @param context.db - Database client for local user preference updates
 * @param context.portalClient - Portal GraphQL client for cryptographic operations
 * @param input.pincode - Validated 6-digit PIN code from request schema
 * @param errors - ORPC error constructors for consistent error responses
 * @returns Success confirmation with verification ID for audit trails
 * @throws CONFLICT when user already has PIN enabled
 * @throws NOT_FOUND when user lacks required wallet address
 * @throws INTERNAL_SERVER_ERROR when Portal verification creation fails
 */
export const set = authRouter.user.pincode.set
  .use(databaseMiddleware)
  .use(portalMiddleware)
  .handler(async function ({
    context: { auth, db, portalClient },
    input,
    errors,
  }) {
    const { pincodeEnabled, pincodeVerificationId, wallet } = auth.user;

    // SECURITY: Prevent duplicate PIN setup to avoid security state confusion
    if (pincodeEnabled && pincodeVerificationId) {
      throw errors.CONFLICT({
        message: "Pincode already set",
      });
    }

    // PREREQUISITE: PIN security requires wallet address for cryptographic binding
    if (!wallet) {
      throw errors.NOT_FOUND({
        message: "User wallet not found",
      });
    }

    // PORTAL-FIRST: Create cryptographic verification before local state update
    const result = await portalClient.raw.request(SET_PINCODE_MUTATION, {
      address: wallet,
      pincode: input.pincode,
    });

    // VALIDATION: Ensure Portal successfully created verification record
    if (!result.createWalletVerification?.id) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create wallet verification",
      });
    }

    // LOCAL STATE: Update user preferences only after Portal success
    // WHY ATOMIC: Database update must succeed to maintain consistency
    await db
      .update(user)
      .set({
        pincodeEnabled: true,
        pincodeVerificationId: result.createWalletVerification.id,
      })
      .where(eq(user.id, auth.user.id));

    // AUDIT: Return verification ID for client-side confirmation and logging
    return {
      success: true,
      verificationId: result.createWalletVerification.id,
    };
  });
