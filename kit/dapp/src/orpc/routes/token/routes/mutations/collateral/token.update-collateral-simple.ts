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

    // Encode collateral claim data according to ERC-735 standard
    const claimData = encodeAbiParameters(
      [
        { name: "amount", type: "uint256" },
        { name: "expiry", type: "uint256" },
      ],
      [BigInt(amount.toString()), BigInt(expiryTimestamp)]
    );

    // Create claim topic for collateral (using padded topic like standalone version)
    const claimTopic = "0x" + "1".padStart(64, "0");

    // Create signature hash for self-issued claim (CONTRACT scheme)
    // For CONTRACT scheme, identity contract acts as issuer and this message hash serves as signature
    const messageHash = keccak256(
      encodePacked(
        ["address", "uint256", "bytes"],
        [onchainID as `0x${string}`, BigInt(claimTopic), claimData]
      )
    );

    // Get the token's identity contract address from Portal
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
        `Token does not have an onchainID. Contract: ${contract}`
      );
    }

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
