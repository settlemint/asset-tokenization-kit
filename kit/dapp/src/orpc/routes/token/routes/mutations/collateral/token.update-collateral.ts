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

import { portalGraphql } from "@/lib/settlemint/portal";
import { ClaimTopic, createClaim } from "@/orpc/helpers/create-claim";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { me as readAccount } from "@/orpc/routes/account/routes/account.me";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { getAddress } from "viem";
import { read } from "../../token.read";

const COLLATERAL_CLAIM_MUTATION = portalGraphql(`
  mutation AddCollateralClaim(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $topic: String!
    $scheme: String!
    $issuer: String!
    $signature: String!
    $data: String!
    $uri: String!
  ) {
    addClaim: ATKContractIdentityImplementationAddClaim(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _topic: $topic
        _scheme: $scheme
        _issuer: $issuer
        _signature: $signature
        _data: $data
        _uri: $uri
      }
    ) {
      transactionHash
    }
  }
`);

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
    const { contract, walletVerification, amount, expiryDays } = input;
    const { auth } = context;

    // AUTHENTICATED ISSUER: Extract user information for claim issuance
    const sender = auth.user;

    // EXPIRY CALCULATION: Convert days to Unix timestamp
    const currentTime = Math.floor(Date.now() / 1000);
    const expiryTimestamp = BigInt(currentTime + expiryDays * 24 * 60 * 60);

    // ACCESS TOKEN DATA: Get token information from context (already loaded by token middleware)
    const tokenData = context.token;

    // Get the token's identity contract address from the graph data
    const onchainID = tokenData.account.identity?.id;

    if (!onchainID) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Token does not have an associated identity contract",
        data: {
          errors: [
            `Token at address ${contract} does not have an associated identity contract`,
          ],
        },
      });
    }

    // Add decimals to the amount
    const amountExact = amount * 10n ** BigInt(tokenData.decimals);

    const account = await call(readAccount, {}, { context });
    if (!account?.identity) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Account does not have an associated identity contract",
        data: {
          errors: [
            `Account at address ${context.auth.user.wallet} does not have an associated identity contract`,
          ],
        },
      });
    }

    // USER-ISSUED CLAIM SIGNATURE: Create signature for user-issued claim
    // The user issues the claim to the identity contract
    const { signature, topicId, claimData } = await createClaim({
      user: sender,
      walletVerification,
      identity: onchainID,
      claim: {
        topic: ClaimTopic.collateral,
        data: {
          amount: amountExact,
          expiryTimestamp,
        },
      },
    });
    // ISSUE CLAIM: Add collateral claim to token's identity contract
    await context.portalClient.mutate(
      COLLATERAL_CLAIM_MUTATION,
      {
        address: onchainID,
        from: sender.wallet,
        topic: topicId.toString(),
        scheme: "1", // ECDSA
        issuer: getAddress(account.identity),
        signature,
        data: claimData,
        uri: "", // Empty URI as not required for collateral claims
      },
      {
        sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // RETURN UPDATED TOKEN DATA: Return the token context
    return await call(read, { tokenAddress: contract }, { context });
  });
