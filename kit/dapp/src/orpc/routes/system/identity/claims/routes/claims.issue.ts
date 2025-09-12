import { type ClaimInfo } from "@/orpc/helpers/claims/create-claim";
import { issueClaim } from "@/orpc/helpers/claims/issue-claim";
import { toClaimInfo } from "@/orpc/helpers/claims/to-claim-info";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { trustedIssuerMiddleware } from "@/orpc/middlewares/auth/trusted-issuer.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { getAddress } from "viem";
import type { ClaimsIssueInput } from "./claims.issue.schema";

// ClaimData (API) -> ClaimInfo (internal) conversion handled by helper

/**
 * Claims issue route handler.
 *
 * Issues a new claim to a user's on-chain identity. This endpoint
 * creates and signs a blockchain claim that gets added to the
 * target identity contract.
 *
 * **Key Requirements:**
 * - ✅ User must have claimIssuer role (validated by blockchainPermissionsMiddleware)
 * - ✅ User must be a trusted issuer for the claim topic (validated in handler)
 * - ✅ Target must be a valid identity contract address
 * - ✅ Issuer must provide valid wallet verification
 *
 * **Blockchain Interaction:**
 * - Creates signed claim using Portal API
 * - Claim gets added to target's identity contract
 * - Transaction is recorded on blockchain
 *
 * Authentication: Required (uses authenticated router)
 * Permissions: Requires "claimIssuer" role and trusted issuer status for the specific claim topic
 * Method: POST /system/identity/claims/issue
 *
 * @param input - Issue parameters with target identity address, claim data, and verification
 * @param context - Request context with auth info and services
 * @returns Promise<ClaimsIssueOutput> - Success status and transaction details
 * @throws UNAUTHORIZED - If user is not authenticated or lacks issuer identity
 * @throws FORBIDDEN - If user is not a trusted issuer for the claim topic
 * @throws INTERNAL_SERVER_ERROR - If claim creation or blockchain interaction fails
 *
 * @example
 * ```typescript
 * // Issue KYC claim
 * const result = await orpc.system.identity.claims.issue.mutate({
 *   targetIdentityAddress: "0x123...",
 *   claim: {
 *     topic: "knowYourCustomer",
 *     data: { claim: "verified" }
 *   },
 *   walletVerification: {
 *     verificationType: "pin",
 *     secretVerificationCode: "1234"
 *   }
 * });
 *
 * // Issue collateral claim
 * const result = await orpc.system.identity.claims.issue.mutate({
 *   targetIdentityAddress: "0x456...",
 *   claim: {
 *     topic: "collateral",
 *     data: {
 *       amount: "1000000000000000000", // 1 ETH in wei
 *       expiryTimestamp: "1735689600" // Unix timestamp
 *     }
 *   },
 *   walletVerification: {
 *     verificationType: "otp",
 *     secretVerificationCode: "123456"
 *   }
 * });
 * ```
 */
export const issue = authRouter.system.identity.claims.issue
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
  .use(
    trustedIssuerMiddleware<ClaimsIssueInput>({
      selectTopic: (i) => i.claim.topic,
    })
  )
  .handler(async ({ context, input }) => {
    const { targetIdentityAddress, claim, walletVerification } = input;

    // Convert API claim data to internal format and issue via helper
    const claimInfo: ClaimInfo = toClaimInfo(claim);

    const transactionHash = await issueClaim({
      user: context.auth.user,
      issuer: context.userIssuerIdentity,
      walletVerification,
      identity: getAddress(targetIdentityAddress),
      claim: claimInfo,
      portalClient: context.portalClient,
    });

    return {
      success: true,
      transactionHash,
      claimTopic: claim.topic,
      targetWallet: targetIdentityAddress,
    };
  });
