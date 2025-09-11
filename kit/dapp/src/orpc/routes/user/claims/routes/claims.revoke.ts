import { portalGraphql } from "@/lib/settlemint/portal";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import {
  canWriteClaims,
  identityPermissionsMiddleware,
} from "@/orpc/middlewares/auth/identity-permissions.middleware";
import { trustedIssuerMiddleware } from "@/orpc/middlewares/auth/trusted-issuer.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { fetchClaimByTopicAndIdentity } from "../../utils/identity.util";
import { ORPCError } from "@orpc/server";
import {
  ClaimsRevokeInputSchema,
  RevokableClaimTopicSchema,
} from "./claims.revoke.schema";

/**
 * Portal GraphQL mutation for revoking claims from identity contracts.
 */
const REVOKE_CLAIM_MUTATION = portalGraphql(`
  mutation RevokeIdentityClaim(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $claimId: String!
    $identity: String!
  ) {
    revokeClaim: ATKIdentityImplementationRevokeClaim(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _claimId: $claimId
        _identity: $identity
      }
    ) {
      transactionHash
    }
  }
`);

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
 *   targetIdentityAddress: "0x1234567890123456789012345678901234567890",
 *   claimTopic: "knowYourCustomer",
 *   walletVerification: {
 *     verificationType: "pin",
 *     secretVerificationCode: "1234"
 *   }
 * });
 *
 * // Revoke collateral claim
 * const result = await orpc.user.claims.revoke.mutate({
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
export const revoke = authRouter.user.claims.revoke
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(portalMiddleware)
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
      getTargetUserId: () => undefined, // No specific user data access needed for claim revocation
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

    // Validate that the claim topic is revokable
    const validTopics = RevokableClaimTopicSchema.options as string[];
    if (!validTopics.includes(claimTopic)) {
      throw errors.BAD_REQUEST({
        message: `Claim topic '${claimTopic}' cannot be revoked via API`,
        data: {
          requestedTopic: claimTopic,
          revokableTopics: validTopics,
        },
      });
    }

    // Verify issuer can revoke this specific claim topic
    // The identityPermissionsMiddleware computes comprehensive permissions combining
    // blockchain roles and trusted issuer status
    if (!canWriteClaims([claimTopic], context.identityPermissions)) {
      throw errors.FORBIDDEN({
        message: `You are not authorized to revoke claims for topic: ${claimTopic}`,
        data: {
          requestedTopic: claimTopic,
          authorizedTopics: context.identityPermissions.claims.write,
        },
      });
    }

    // Fetch the claim by topic and identity, with extracted claimId for smart contract use
    let extractedClaimId: string;
    try {
      const result = await fetchClaimByTopicAndIdentity({
        claimTopic,
        identityAddress: targetIdentityAddress,
        context,
      });
      extractedClaimId = result.extractedClaimId;
    } catch (error: unknown) {
      let message = "";
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      const isMultipleClaims =
        typeof message === "string" &&
        message.includes("Multiple active claims");
      const isBadRequest = error instanceof ORPCError && error.status === 400;
      if (isMultipleClaims || isBadRequest) {
        throw errors.BAD_REQUEST({
          message:
            `Multiple claims found for topic "${claimTopic}" and identity "${targetIdentityAddress}". ` +
            `This may be due to duplicate claims. Please contact support or remove duplicates before retrying.`,
          data: {
            claimTopic,
            targetIdentityAddress,
            issuerIdentity: context.userIssuerIdentity,
          },
        });
      }
      throw error;
    }

    // Submit claim revocation to blockchain via Portal
    const result = await context.portalClient.mutate(
      REVOKE_CLAIM_MUTATION,
      {
        // Call on issuer's identity (has management key), targeting subject identity via input.identity
        address: issuerIdentity,
        from: context.auth.user.wallet,
        claimId: extractedClaimId,
        identity: targetIdentityAddress,
      },
      {
        sender: context.auth.user,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    return {
      success: true,
      transactionHash: result,
      claimId: extractedClaimId,
    };
  });
