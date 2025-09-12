// Revoke flow handled via helper
import { revokeClaim } from "@/orpc/helpers/claims/revoke-claim";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { trustedIssuerMiddleware } from "@/orpc/middlewares/auth/trusted-issuer.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { fetchClaimByTopicAndIdentity } from "@/orpc/routes/user/utils/identity.util";
import { type ClaimsRevokeInput } from "./claims.revoke.schema";

/**
 * Claims revoke route handler.
 *
 * Revokes an existing claim from a user's on-chain identity. This endpoint
 * removes a previously issued claim from the user's identity contract.
 *
 * **Key Requirements:**
 * - ✅ User must have claimIssuer role
 * - ✅ Target user must have a wallet and identity
 * - ✅ Revoker must provide valid wallet verification
 * - ✅ Claim must exist on the target user's identity
 *
 * **Blockchain Interaction:**
 * - Calls identity contract to remove the claim
 * - Transaction is recorded on blockchain
 * - Claim becomes invalid immediately
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "claimIssuer" role
 * Method: POST /system/identity/claims/revoke
 *
 * @param input - Revoke parameters with target user, claim topic, and verification
 * @param context - Request context with database, TheGraph, and auth info
 * @returns Promise<ClaimsRevokeOutput> - Success status and transaction details
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws FORBIDDEN - If user lacks claimIssuer role
 * @throws NOT_FOUND - If target user is not found or has no identity
 * @throws BAD_REQUEST - If claim doesn't exist or cannot be revoked
 * @throws INTERNAL_SERVER_ERROR - If blockchain interaction fails
 *
 * @example
 * ```typescript
 * // Revoke KYC claim
 * const result = await orpc.system.identity.claims.revoke.mutate({
 *   targetIdentityAddress: "0x1234567890123456789012345678901234567890",
 *   claimTopic: "knowYourCustomer",
 *   walletVerification: {
 *     verificationType: "pin",
 *     secretVerificationCode: "1234"
 *   }
 * });
 *
 * // Revoke collateral claim
 * const result = await orpc.system.identity.claims.revoke.mutate({
 *   targetIdentityAddress: "0x9876543210987654321098765432109876543210",
 *   claimTopic: "collateral",
 *   walletVerification: {
 *     verificationType: "otp",
 *     secretVerificationCode: "123456"
 *   }
 * });
 * ```
 *
 * @remarks
 * - Revocation is permanent and cannot be undone
 * - Reason field is optional but recommended for audit trails
 * - Only the original issuer or identity manager can revoke claims
 * - Revoked claims are removed from user's active claims list immediately
 */
export const revoke = authRouter.system.identity.claims.revoke
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.claimRevoke,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(
    trustedIssuerMiddleware<ClaimsRevokeInput>({
      selectTopic: (i) => i.claimTopic,
    })
  )
  .handler(async ({ context, input, errors }) => {
    const { claimTopic, walletVerification, targetIdentityAddress } = input;

    // Ensure user has issuer identity
    const issuerIdentity = context.userIssuerIdentity;
    if (!issuerIdentity) {
      throw errors.UNAUTHORIZED({
        message: "User does not have an issuer identity",
      });
    }

    // Fetch the claim by topic and identity; let utility surface standardized ORPC errors
    const { extractedClaimId } = await fetchClaimByTopicAndIdentity({
      claimTopic,
      identityAddress: targetIdentityAddress,
      context,
      errors,
    });

    // Submit claim revocation via helper
    const result = await revokeClaim({
      user: context.auth.user,
      issuer: issuerIdentity,
      walletVerification,
      identity: targetIdentityAddress,
      claimId: extractedClaimId,
      portalClient: context.portalClient,
    });

    return {
      success: true,
      transactionHash: result,
      claimId: extractedClaimId,
    };
  });
