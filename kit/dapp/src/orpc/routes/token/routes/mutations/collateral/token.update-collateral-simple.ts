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
import {
  encodeAbiParameters,
  encodePacked,
  keccak256,
  decodeAbiParameters,
} from "viem";
import { z } from "zod";

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
 * GraphQL query for getting token's onchainID.
 */
const GET_TOKEN_ONCHAIN_ID_QUERY = portalGraphql(`
  query GetTokenOnchainID($address: String!) {
    ATKBondImplementation(address: $address) {
      onchainID
    }
    ATKEquityImplementation(address: $address) {
      onchainID
    }
    ATKFundImplementation(address: $address) {
      onchainID
    }
    ATKStableCoinImplementation(address: $address) {
      onchainID
    }
    ATKDepositImplementation(address: $address) {
      onchainID
    }
  }
`);

/**
 * Zod schema for token onchainID response
 */
const TokenOnchainIdResponseSchema = z.object({
  ATKBondImplementation: z
    .object({
      onchainID: z.string(),
    })
    .nullable(),
  ATKEquityImplementation: z
    .object({
      onchainID: z.string(),
    })
    .nullable(),
  ATKFundImplementation: z
    .object({
      onchainID: z.string(),
    })
    .nullable(),
  ATKStableCoinImplementation: z
    .object({
      onchainID: z.string(),
    })
    .nullable(),
  ATKDepositImplementation: z
    .object({
      onchainID: z.string(),
    })
    .nullable(),
});

/**
 * GraphQL query for getting claims by topic
 */
const GET_CLAIMS_BY_TOPIC_QUERY = portalGraphql(`
  query GetClaimsByTopic($address: String!, $topic: String!) {
    ATKContractIdentityImplementation(address: $address) {
      getClaimIdsByTopic(_topic: $topic) {
        claimIds
      }
    }
  }
`);

/**
 * GraphQL query for getting claim details
 */
const GET_CLAIM_QUERY = portalGraphql(`
  query GetClaim($address: String!, $claimId: String!) {
    ATKContractIdentityImplementation(address: $address) {
      getClaim(_claimId: $claimId) {
        topic
        scheme
        issuer
        signature
        data
        uri
      }
    }
  }
`);

/**
 * Zod schema for claims by topic response
 */
const ClaimsByTopicResponseSchema = z.object({
  ATKContractIdentityImplementation: z
    .object({
      getClaimIdsByTopic: z.object({
        claimIds: z.array(z.string()),
      }),
    })
    .nullable(),
});

/**
 * Zod schema for claim details response
 */
const ClaimResponseSchema = z.object({
  ATKContractIdentityImplementation: z
    .object({
      getClaim: z
        .object({
          topic: z.string(),
          scheme: z.string(),
          issuer: z.string(),
          signature: z.string(),
          data: z.string(),
          uri: z.string(),
        })
        .nullable(),
    })
    .nullable(),
});

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

    // Get the token's identity contract address from Portal first
    const tokenIdentityAddress = await context.portalClient.query(
      GET_TOKEN_ONCHAIN_ID_QUERY,
      { address: contract },
      TokenOnchainIdResponseSchema
    );

    // Extract onchainID from whichever token type responded
    const onchainID =
      tokenIdentityAddress.ATKBondImplementation?.onchainID ||
      tokenIdentityAddress.ATKEquityImplementation?.onchainID ||
      tokenIdentityAddress.ATKFundImplementation?.onchainID ||
      tokenIdentityAddress.ATKStableCoinImplementation?.onchainID ||
      tokenIdentityAddress.ATKDepositImplementation?.onchainID;

    if (!onchainID) {
      throw new Error(
        `Token does not have an OnchainID identity contract linked. Contract: ${contract}`
      );
    }

    console.log(`🔧 Adding collateral claim to identity: ${onchainID}`);

    // Encode collateral claim data according to ERC-735 standard
    const claimData = encodeAbiParameters(
      [
        { name: "amount", type: "uint256" },
        { name: "expiryTimestamp", type: "uint256" },
      ],
      [BigInt(amount.toString()), BigInt(expiryTimestamp)]
    );

    // Create claim topic for collateral (using padded topic like standalone version)
    const claimTopic = "0x" + "1".padStart(64, "0");
    console.log(`🔧 Claim topic: ${claimTopic}`);
    console.log(`🔧 Claim data: ${claimData}`);

    // Create signature hash for self-issued claim (CONTRACT scheme)
    // For CONTRACT scheme, identity contract acts as issuer and this message hash serves as signature
    const messageHash = keccak256(
      encodePacked(
        ["address", "uint256", "bytes"],
        [onchainID as `0x${string}`, BigInt(claimTopic), claimData]
      )
    );
    console.log(`🔧 Message hash: ${messageHash}`);

    console.log(`🔧 Executing Portal mutation with params:`, {
      address: onchainID,
      from: sender.wallet,
      topic: claimTopic,
      scheme: "3",
      issuer: onchainID,
      signature: messageHash,
      data: claimData,
      uri: "",
    });

    const mutationResult = await context.portalClient.mutate(
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

    console.log(`✅ Portal mutation result:`, mutationResult);

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

/**
 * Debug function to verify collateral claim on-chain
 */
export async function verifyCollateralClaim(
  contract: string,
  portalClient: any
) {
  console.log("🔍 Verifying collateral claim for token:", contract);

  try {
    // Step 1: Get the identity contract address
    console.log("Step 1: Getting identity contract address...");
    const tokenIdentityAddress = await portalClient.query(
      GET_TOKEN_ONCHAIN_ID_QUERY,
      { address: contract },
      TokenOnchainIdResponseSchema
    );

    const onchainID =
      tokenIdentityAddress.ATKBondImplementation?.onchainID ||
      tokenIdentityAddress.ATKEquityImplementation?.onchainID ||
      tokenIdentityAddress.ATKFundImplementation?.onchainID ||
      tokenIdentityAddress.ATKStableCoinImplementation?.onchainID ||
      tokenIdentityAddress.ATKDepositImplementation?.onchainID;

    if (!onchainID) {
      console.log("❌ No onchainID found for token:", contract);
      return;
    }

    console.log("✅ Identity contract address:", onchainID);

    // Step 2: Get claims for collateral topic (topic 1)
    console.log("Step 2: Getting claims for topic 1...");
    const collateralTopic =
      "0x0000000000000000000000000000000000000000000000000000000000000001";

    const claimsResponse = await portalClient.query(
      GET_CLAIMS_BY_TOPIC_QUERY,
      { address: onchainID, topic: collateralTopic },
      ClaimsByTopicResponseSchema
    );

    const claimIds =
      claimsResponse.ATKContractIdentityImplementation?.getClaimIdsByTopic
        ?.claimIds || [];
    console.log("✅ Found claim IDs:", claimIds);

    if (claimIds.length === 0) {
      console.log("❌ No collateral claims found for topic 1");
      return;
    }

    // Step 3: Get details for each claim
    console.log("Step 3: Getting claim details...");
    for (const claimId of claimIds) {
      console.log(`\n📋 Claim ID: ${claimId}`);

      const claimResponse = await portalClient.query(
        GET_CLAIM_QUERY,
        { address: onchainID, claimId },
        ClaimResponseSchema
      );

      const claim = claimResponse.ATKContractIdentityImplementation?.getClaim;
      if (claim) {
        console.log("  Topic:", claim.topic);
        console.log("  Scheme:", claim.scheme);
        console.log("  Issuer:", claim.issuer);
        console.log("  Data:", claim.data);

        // Try to decode the data (amount, expiryTimestamp)
        try {
          const decodedData = decodeAbiParameters(
            [
              { type: "uint256", name: "amount" },
              { type: "uint256", name: "expiryTimestamp" },
            ],
            claim.data as `0x${string}`
          );

          console.log("  📊 Decoded amount:", decodedData[0].toString());
          console.log(
            "  📅 Decoded expiry:",
            new Date(Number(decodedData[1]) * 1000).toISOString()
          );
        } catch (decodeError) {
          console.log("  ❌ Failed to decode claim data:", decodeError);
        }
      }
    }
  } catch (error) {
    console.error("❌ Error verifying collateral claim:", error);
  }
}
