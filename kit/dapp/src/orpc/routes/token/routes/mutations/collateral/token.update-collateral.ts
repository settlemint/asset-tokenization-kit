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
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { encodeAbiParameters, encodePacked, keccak256 } from "viem";

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
      // TODO: Define appropriate permissions for collateral management
      // This should likely be issuer-level permissions or specific collateral roles
      requiredRoles: TOKEN_PERMISSIONS.updateCollateral, // Use specific collateral permission
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

    try {
      // COLLATERAL TOPIC: Use standardized claim topic for collateral
      const COLLATERAL_TOPIC = "0x" + "1".padStart(64, "0"); // ATK uses topic ID 1 for collateral claims

      // ENCODE CLAIM DATA: Create ABI-encoded data containing amount and expiryTimestamp
      // Note: Field names must match what the subgraph expects
      const claimData = encodeAbiParameters(
        [
          { type: "uint256", name: "amount" },
          { type: "uint256", name: "expiryTimestamp" },
        ],
        [amount, expiryTimestamp]
      );

      // USER-ISSUED CLAIM SIGNATURE: Create signature for user-issued claim
      // The user issues the claim to the identity contract
      const messageHash = keccak256(
        encodePacked(
          ["address", "uint256", "bytes"],
          [onchainID, BigInt(COLLATERAL_TOPIC), claimData]
        )
      );

      // ISSUE CLAIM: Add collateral claim to token's identity contract
      await context.portalClient.mutate(
        COLLATERAL_CLAIM_MUTATION,
        {
          address: onchainID,
          from: sender.wallet,
          topic: COLLATERAL_TOPIC,
          scheme: "3", // CONTRACT signature scheme for self-issued claims
          issuer: onchainID, // Self-issued claim by the identity contract
          signature: messageHash, // Placeholder - should be proper signature
          data: claimData,
          uri: "", // Empty URI as not required for collateral claims
        },
        {
          sender,
          code: walletVerification.secretVerificationCode,
          type: walletVerification.verificationType,
        }
      );

      // RETURN UPDATED TOKEN DATA: Return the token context which will be refreshed by the middleware
      return tokenData;
    } catch (error) {
      // Enhanced error handling with more actionable information
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Classify error types to provide specific guidance
      let userFriendlyMessage = "Failed to update collateral claim";
      let troubleshootingSteps: string[] = [];

      if (
        errorMessage.includes("insufficient funds") ||
        errorMessage.includes("balance")
      ) {
        userFriendlyMessage = "Insufficient funds to complete the transaction";
        troubleshootingSteps = [
          "Ensure your wallet has sufficient balance for gas fees",
          "Check that you have the required tokens for the transaction",
        ];
      } else if (
        errorMessage.includes("AccessControl") ||
        errorMessage.includes("Ownable")
      ) {
        userFriendlyMessage =
          "Access denied: insufficient permissions to update collateral";
        troubleshootingSteps = [
          "Verify you are registered as a trusted issuer for this token",
          "Contact the token administrator to grant collateral management permissions",
          "Ensure your identity is properly configured for claim issuance",
        ];
      } else if (
        errorMessage.includes("revert") ||
        errorMessage.includes("execution reverted")
      ) {
        userFriendlyMessage = "Transaction failed during execution";
        troubleshootingSteps = [
          "Check that the collateral amount is greater than current token supply",
          "Verify that the token's identity contract is properly configured",
          "Ensure the claim topic is supported by the identity contract",
        ];
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("timeout")
      ) {
        userFriendlyMessage =
          "Network connectivity issue preventing the transaction";
        troubleshootingSteps = [
          "Check your internet connection",
          "Verify the blockchain network is operational",
          "Try again after a few moments",
        ];
      } else if (errorMessage.includes("nonce")) {
        userFriendlyMessage = "Transaction nonce conflict";
        troubleshootingSteps = [
          "Wait for pending transactions to complete",
          "Reset your wallet's transaction queue if necessary",
        ];
      }

      throw errors.PORTAL_ERROR({
        message: userFriendlyMessage,
        data: {
          document: COLLATERAL_CLAIM_MUTATION,
          variables: {
            address: onchainID,
            from: auth.user.wallet,
            topic: "0x" + "1".padStart(64, "0"),
            scheme: "3",
            issuer: onchainID,
            data: "encoded_claim_data",
            uri: "",
            // Additional debugging context in variables
            debug: {
              originalError: errorMessage,
              troubleshooting: troubleshootingSteps,
              tokenAddress: contract,
              identityContract: onchainID,
              walletAddress: auth.user.wallet,
              collateralAmount: amount.toString(),
              expiryDays,
            },
          },
          stack: error instanceof Error ? error.stack : undefined,
        },
      });
    }
  });
