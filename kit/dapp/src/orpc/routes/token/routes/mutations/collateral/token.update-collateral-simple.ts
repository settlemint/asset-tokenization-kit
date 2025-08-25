/**
 * Token Collateral Management Handler
 *
 * @fileoverview
 * Implements collateral claim management for token supply backing.
 * Allows authorized claim issuers to update collateral amounts through
 * ERC-735 claim issuance on OnchainID contracts.
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";
import { encodeAbiParameters, encodePacked, keccak256 } from "viem";

/**
 * GraphQL mutation for adding collateral claims on identity contracts.
 */
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
 * ORPC handler for collateral claim management.
 */
export const updateCollateral = tokenRouter.token.updateCollateral
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.updateCollateral,
    })
  )
  .handler(async ({ input, context }) => {
    const { contract, amount, expiryDays, walletVerification } = input;
    const { auth } = context;

    // Extract user information for transaction authorization
    const sender = auth.user;

    // Calculate expiry timestamp
    const expiryTimestamp =
      Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

    // Get the token's identity contract address from the graph data
    const tokenData = context.token;
    const onchainID = tokenData.account.identity?.id;

    if (!onchainID) {
      throw new Error(
        `Token at address ${contract} does not have an associated identity contract`
      );
    }

    // Create claim topic for collateral (using padded topic like standalone version)
    const claimTopic = "0x" + "1".padStart(64, "0");

    // Step 1: Ensure the identity contract is a trusted issuer for collateral topic
    // Get the trusted issuers registry from system context
    // We need to access the system data to get the registry address
    // For now, we'll proceed with the claim and let the user know to add manually
    // TODO: Implement automatic trusted issuer addition once we have access to system context

    // Note: Make sure the identity contract is added as a trusted issuer for topic 1

    // Encode collateral claim data according to ERC-735 standard
    const claimData = encodeAbiParameters(
      [
        { name: "amount", type: "uint256" },
        { name: "expiryTimestamp", type: "uint256" },
      ],
      [BigInt(amount.toString()), BigInt(expiryTimestamp)]
    );

    // Create signature hash for self-issued claim (CONTRACT scheme)
    // For CONTRACT scheme, identity contract acts as issuer and this message hash serves as signature
    const messageHash = keccak256(
      encodePacked(
        ["address", "uint256", "bytes"],
        [onchainID, BigInt(claimTopic), claimData]
      )
    );

    await context.portalClient.mutate(
      COLLATERAL_CLAIM_MUTATION,
      {
        address: onchainID,
        from: sender.wallet,
        topic: claimTopic,
        scheme: "3", // CONTRACT signature scheme for self-issued claims
        issuer: onchainID, // Self-issued claim by identity contract
        signature: messageHash,
        data: claimData,
        uri: "",
      },
      {
        sender: sender,
        code: walletVerification.secretVerificationCode,
        type: walletVerification.verificationType,
      }
    );

    // Collateral claim transaction submitted successfully
    // Note: The Graph subgraph may take 30-60 seconds to index the new claim
    // If collateral value shows 0, add the identity contract as a trusted issuer

    // Return updated token data
    return await call(
      read,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );
  });
