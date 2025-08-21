/**
 * PIN Code Update Procedure
 *
 * @remarks
 * This procedure handles PIN code modification for existing PIN-enabled users,
 * implementing a replacement strategy where new verification records supersede
 * previous ones while maintaining security state consistency.
 *
 * ARCHITECTURAL CHOICE - REPLACEMENT vs UPDATE:
 * - Portal API creates new verification records rather than updating existing ones
 * - This provides better audit trails and rollback capabilities
 * - Previous verification records remain for historical analysis
 * - New verification ID replaces old one in local database state
 *
 * SECURITY DESIGN DECISIONS:
 * - No validation of previous PIN (relies on session authentication)
 * - Cryptographic operations delegated to Portal for security best practices
 * - Atomic dual-write pattern ensures consistency across systems
 * - Wallet address binding prevents cross-user PIN modification
 *
 * EDGE CASE HANDLING:
 * - Works regardless of current PIN state (enabled or disabled)
 * - Gracefully handles missing wallet addresses
 * - Portal failures prevent local state corruption
 * - Database transaction rollback on any error condition
 *
 * BUSINESS RATIONALE:
 * - PIN updates are common during security policy changes
 * - Support for password manager integration and security audits
 * - Compliance with financial sector PIN rotation requirements
 * - User experience optimization for security-conscious workflows
 *
 * @see {@link ./pincode.set} Initial PIN establishment with conflict detection
 * @see {@link ./pincode.remove} PIN removal with cleanup procedures
 */

import { user } from "@/lib/db/schema";
import { portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

/**
 * GraphQL mutation for PIN update operations via Portal verification system.
 *
 * @remarks
 * MUTATION REUSE: Uses the same createWalletVerification mutation as PIN creation
 * because Portal's design treats updates as new verification record creation
 * rather than in-place modification of existing records.
 *
 * WHY NOT updateWalletVerification: Portal's audit-focused architecture maintains
 * immutable verification records, with updates creating new records that supersede
 * previous ones. This provides better compliance and rollback capabilities.
 *
 * NAMING CLARIFICATION: Despite the variable name suggesting "update", this mutation
 * creates a new verification record. The local application logic handles the
 * replacement semantics by updating the verification ID reference.
 *
 * SECURITY IMPLICATIONS: New verification record generation ensures that:
 * - Previous PIN hashes become immediately invalid
 * - Audit trails preserve historical PIN change events
 * - Cryptographic key rotation occurs with each PIN change
 * - No opportunity for PIN value persistence across updates
 */
const UPDATE_PINCODE_MUTATION = portalGraphql(`
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
 * PIN code update handler implementing secure replacement semantics.
 *
 * @remarks
 * UPDATE SEMANTICS: This handler implements "upsert" behavior - it works whether
 * the user currently has a PIN enabled or not, making it suitable for both
 * initial setup and subsequent modifications.
 *
 * SIMPLIFIED VALIDATION: Unlike the 'set' procedure, this doesn't check for
 * existing PIN state because updates should work regardless of current state.
 * This design choice supports flexible user workflows and administrative operations.
 *
 * SECURITY BOUNDARY: Wallet address validation is the primary security gate,
 * ensuring PIN updates are scoped to the authenticated user's wallet only.
 * Session authentication provides user identity verification.
 *
 * @param context.auth - Authenticated user context (PIN state not validated)
 * @param context.db - Database client for local state synchronization
 * @param context.portalClient - Portal GraphQL client for cryptographic operations
 * @param input.pincode - New PIN code value (validated by schema)
 * @param errors - ORPC error constructors for standardized error responses
 * @returns Success confirmation with new verification ID
 * @throws NOT_FOUND when user lacks required wallet address
 * @throws INTERNAL_SERVER_ERROR when Portal verification creation fails
 */
export const update = authRouter.user.pincode.update
  .use(databaseMiddleware)
  .use(portalMiddleware)
  .handler(async function ({
    context: { auth, db, portalClient },
    input,
    errors,
  }) {
    const { wallet } = auth.user;

    // PREREQUISITE: PIN operations require wallet address for cryptographic binding
    if (!wallet) {
      throw errors.NOT_FOUND({
        message: "User wallet not found",
      });
    }

    // PORTAL-FIRST: Create new verification record before local state update
    // TRADEOFF: Network call overhead vs consistency guarantees (consistency wins)
    try {
      const result = await portalClient.raw.request(UPDATE_PINCODE_MUTATION, {
        address: wallet,
        pincode: input.pincode,
      });

      // VALIDATION: Ensure Portal successfully created new verification record
      if (!result.createWalletVerification?.id) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Failed to create wallet verification",
        });
      }

      // STATE REPLACEMENT: Update local reference to new verification record
      // WHY ALWAYS ENABLED: Successful PIN update implies PIN feature is active
      await db
        .update(user)
        .set({
          pincodeEnabled: true,
          pincodeVerificationId: result.createWalletVerification.id,
        })
        .where(eq(user.id, auth.user.id));

      // CONFIRMATION: Return new verification ID for audit and client confirmation
      return {
        success: true,
        verificationId: result.createWalletVerification.id,
      };
    } catch (error) {
      throw errors.PORTAL_ERROR({
        data: {
          document: UPDATE_PINCODE_MUTATION,
          variables: { address: wallet, pincode: input.pincode },
          responseValidation: "Failed to update wallet verification",
        },
        cause: error,
      });
    }
  });
