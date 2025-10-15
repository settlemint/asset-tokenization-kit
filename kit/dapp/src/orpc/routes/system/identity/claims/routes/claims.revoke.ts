// Revoke flow handled via helper
import { revokeClaim } from "@/orpc/helpers/claims/revoke-claim";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { fetchClaimByTopicAndIdentity } from "@/orpc/routes/user/utils/identity.util";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { ethereumAddress } from "@atk/zod/ethereum-address";
import { getAddress, type Address } from "viem";
import * as z from "zod";

const READ_USER_TRUSTED_ISSUER_TOPICS_QUERY = theGraphGraphql(`
  query GetUserTrustedIssuerTopics($userWallet: Bytes!) {
    trustedIssuers(where: { account_: { id: $userWallet } }) {
      id
      claimTopics {
        name
      }
    }
  }
`);

const TrustedIssuerTopicsResponseSchema = z.object({
  trustedIssuers: z.array(
    z.object({
      id: ethereumAddress,
      claimTopics: z.array(
        z.object({
          name: z.string(),
        })
      ),
    })
  ),
});

/**
 * Claims revoke route handler.
 *
 * Revokes an existing claim from a user's on-chain identity. This endpoint
 * removes a previously issued claim from the user's identity contract.
 *
 * **Key Requirements:**
 * - ✅ Target user must have an identity
 * - ✅ Revoker must provide valid wallet verification
 * - ✅ Claim must exist on the target user's identity
 * - ✅ Either the revoker controls the target identity or is an authorized issuer for the claim topic
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
 * - Revoked claims are removed from user's active claims list immediately
 */
export const revoke = authRouter.system.identity.claims.revoke
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { claimTopic, walletVerification, targetIdentityAddress } = input;

    const userIdentityAddress = context.system?.userIdentity?.address;
    const normalizedUserIdentity = userIdentityAddress?.toLowerCase();
    const normalizedTargetIdentity = targetIdentityAddress.toLowerCase();
    const isSelfRevocation = normalizedUserIdentity === normalizedTargetIdentity;

    if (!isSelfRevocation) {
      const canRevoke = context.system?.userPermissions.actions.claimRevoke;

      if (!canRevoke) {
        throw errors.USER_NOT_AUTHORIZED({
          data: {
            requiredRoles: SYSTEM_PERMISSIONS.claimRevoke,
          },
        });
      }
    }

    let issuerIdentity: Address | null = null;

    if (isSelfRevocation) {
      if (!userIdentityAddress) {
        throw errors.FORBIDDEN({
          message:
            "Authenticated issuer identity required to revoke own claims",
        });
      }

      issuerIdentity = getAddress(userIdentityAddress);
    } else {
      if (!context.theGraphClient) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "The Graph client is unavailable",
        });
      }

      const { trustedIssuers } = await context.theGraphClient.query(
        READ_USER_TRUSTED_ISSUER_TOPICS_QUERY,
        {
          input: { userWallet: context.auth.user.wallet },
          output: TrustedIssuerTopicsResponseSchema,
        }
      );

      if (!trustedIssuers || trustedIssuers.length === 0) {
        throw errors.FORBIDDEN({
          message: `You are not a trusted issuer for topic(s): ${claimTopic}`,
        });
      }

      const authorizedIssuer = trustedIssuers.find((issuer) =>
        issuer.claimTopics.some((topic) => topic.name === claimTopic)
      );

      if (!authorizedIssuer) {
        throw errors.FORBIDDEN({
          message: `You are not a trusted issuer for topic(s): ${claimTopic}`,
        });
      }

      issuerIdentity = getAddress(authorizedIssuer.id);
    }

    if (!issuerIdentity) {
      throw errors.FORBIDDEN({
        message: "Unable to determine issuer identity for claim revocation",
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
