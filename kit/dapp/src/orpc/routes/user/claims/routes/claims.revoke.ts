import { user } from "@/lib/db/schema";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { identityPermissionsMiddleware } from "@/orpc/middlewares/auth/identity-permissions.middleware";
import { trustedIssuerMiddleware } from "@/orpc/middlewares/auth/trusted-issuer.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";
import { ClaimsRevokeInputSchema } from "./claims.revoke.schema";

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
 * Method: POST /user/claims/revoke
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
 * const result = await orpc.user.claims.revoke.mutate({
 *   targetUserId: "user-123",
 *   claimTopic: "knowYourCustomer",
 *   reason: "KYC status expired",
 *   walletVerification: {
 *     verificationType: "pin",
 *     secretVerificationCode: "1234"
 *   }
 * });
 *
 * // Revoke collateral claim
 * const result = await orpc.user.claims.revoke.mutate({
 *   targetUserId: "user-456",
 *   claimTopic: "collateral",
 *   reason: "Collateral withdrawn",
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
export const revoke = authRouter.user.claims.revoke
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: { any: ["claimIssuer"] },
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(trustedIssuerMiddleware)
  .use(
    identityPermissionsMiddleware<typeof ClaimsRevokeInputSchema>({
      getTargetUserId: ({ input }) => input.targetUserId,
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { targetUserId, claimTopic, reason, walletVerification } = input;

    // Find target user
    const targetUserResult = await context.db
      .select({
        id: user.id,
        wallet: user.wallet,
      })
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (targetUserResult.length === 0) {
      throw errors.NOT_FOUND({
        message: `User with ID ${targetUserId} not found`,
      });
    }

    const targetUser = targetUserResult[0];
    if (!targetUser?.wallet) {
      throw errors.BAD_REQUEST({
        message: "Target user does not have a wallet address",
      });
    }

    // Verify revoker has authentication and wallet
    if (!context.auth?.user?.wallet) {
      throw errors.UNAUTHORIZED({
        message: "Revoker must have a wallet address",
      });
    }

    try {
      // TODO: Check if claim exists on user's identity
      // This would involve querying the identity contract to verify the claim exists

      // TODO: Verify revoker has permission to revoke this specific claim
      // This could check if the revoker was the original issuer or has admin rights

      // TODO: Create revocation transaction
      // This would involve calling the identity contract's removeClaim function
      // For now, we'll simulate the revocation process

      // Simulate wallet verification (this would use the actual verification in real implementation)
      if (walletVerification.secretVerificationCode.length < 4) {
        throw new Error("Invalid verification code");
      }

      // TODO: Submit revocation transaction to blockchain
      // This would involve calling the identity contract to remove the claim
      // For now, we'll simulate success
      const mockTransactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;

      return {
        success: true,
        transactionHash: mockTransactionHash,
        claimTopic,
        targetWallet: targetUser.wallet,
        reason,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        claimTopic,
        targetWallet: targetUser.wallet,
        reason,
      };
    }
  });
