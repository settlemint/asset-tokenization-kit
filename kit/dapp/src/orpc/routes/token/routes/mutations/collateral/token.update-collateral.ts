/**
 * Token Collateral Management Handler
 *
 * @fileoverview
 * Implements collateral claim management for tokenized assets that require
 * backing assets to support their issuance. This is critical for stablecoins,
 * asset-backed tokens, and regulatory compliance scenarios.
 *
 * @remarks
 * COLLATERAL ARCHITECTURE:
 * - Collateral is represented as ERC-735 claims on the token's OnchainID identity
 * - Claims contain: amount (supply cap), expiry timestamp, and issuer signature
 * - Only trusted claim issuers registered in the identity registry can issue claims
 * - Claims must be validated and non-expired before being used for minting
 *
 * BUSINESS LOGIC:
 * - Collateral amount acts as a maximum supply cap for the token
 * - New collateral must be greater than current total supply
 * - Claims have expiry dates to ensure periodic validation
 * - Multiple claims can exist, but only the first valid one is used
 *
 * SECURITY BOUNDARIES:
 * - Permission validation ensures only authorized issuers can update claims
 * - Identity verification required for all collateral operations
 * - Claim validation prevents manipulation of supply limits
 * - Expiry enforcement ensures claims don't become stale
 *
 * COMPLIANCE INTEGRATION:
 * - Collateral claims support regulatory requirements for asset backing
 * - Identity-based claims provide audit trail for compliance
 * - Expiry mechanism ensures periodic re-validation of backing assets
 * - Integration with identity registry maintains trust boundaries
 */

import { ClaimTopic } from "@/orpc/helpers/claims/create-claim";
import { issueClaim } from "@/orpc/helpers/claims/issue-claim";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { read } from "../../token.read";

const logger = createLogger();

/**
 * ORPC handler for updating token collateral claims.
 *
 * @remarks
 * CLAIM AUTHORIZATION: Uses token permission middleware to verify the user
 * has appropriate permissions to manage collateral claims. This prevents
 * unauthorized manipulation of supply limits.
 *
 * COLLATERAL WORKFLOW:
 * 1. Validate user has collateral management permissions
 * 2. Calculate expiry timestamp from days parameter
 * 3. Ensure new collateral amount exceeds current supply
 * 4. Issue new collateral claim on token's identity contract
 * 5. Wait for claim to be verified and indexed
 * 6. Return updated token data with new collateral information
 *
 * @param input - Collateral parameters including amount and expiry
 * @param context - ORPC context with authenticated user and Portal client
 * @param errors - Standardized error constructors for validation failures
 * @returns Updated token data including new collateral information
 * @throws UNAUTHORIZED When user lacks collateral management permissions
 * @throws INPUT_VALIDATION_FAILED When collateral amount is invalid
 * @throws PORTAL_ERROR When claim issuance fails or verification is invalid
 */
export const updateCollateral = tokenRouter.token.updateCollateral
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.updateCollateral,
      requiredExtensions: ["COLLATERAL"],
    })
  )
  .handler(async ({ input, context, errors }) => {
    // INPUT EXTRACTION: Destructure collateral parameters from validated input
    const { contract, walletVerification, amount, expiryTimestamp } = input;
    const { auth } = context;

    // AUTHENTICATED ISSUER: Extract user information for claim issuance
    const sender = auth.user;

    // ACCESS TOKEN DATA: Get token information from context (already loaded by token middleware)
    const tokenData = context.token;

    // Get the token's identity contract address from the graph data
    const onchainID = tokenData.identity?.id;

    if (!onchainID) {
      const errorMessage = `Token at address ${contract} does not have an associated identity contract`;
      logger.error(errorMessage);
      throw errors.INTERNAL_SERVER_ERROR({
        message: errorMessage,
      });
    }

    const userIdentity = context.system.userIdentity?.address;
    if (!userIdentity) {
      const errorMessage = `Account at address ${context.auth.user.wallet} does not have an associated identity contract`;
      logger.error(errorMessage);
      throw errors.INTERNAL_SERVER_ERROR({
        message: errorMessage,
      });
    }

    // ISSUE CLAIM: Add collateral claim to token's identity contract
    await issueClaim({
      user: sender,
      issuer: userIdentity,
      walletVerification,
      identity: onchainID,
      claim: {
        topic: ClaimTopic.collateral,
        data: {
          amount: amount,
          expiryTimestamp: BigInt(Math.floor(expiryTimestamp.getTime() / 1000)),
        },
      },
      portalClient: context.portalClient,
    });

    // RETURN UPDATED TOKEN DATA: Return the token context
    return await call(read, { tokenAddress: contract }, { context });
  });
