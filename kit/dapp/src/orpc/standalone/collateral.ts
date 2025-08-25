/**
 * Standalone Collateral Management API
 *
 * This module provides a standalone implementation of collateral management
 * that doesn't integrate with the main ORPC router to avoid circular dependencies.
 * It can be called directly from the UI components.
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { encodePacked, keccak256, encodeAbiParameters } from "viem";

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

export interface CollateralUpdateParams {
  tokenIdentityAddress: string;
  userWallet: string;
  amount: bigint;
  expiryDays: number;
  walletVerification: {
    secretVerificationCode: string;
    verificationType?: "OTP" | "PINCODE" | "SECRET_CODES";
  };
  portalClient: {
    mutate: (
      mutation: string,
      variables: Record<string, unknown>,
      context?: Record<string, unknown>
    ) => Promise<unknown>;
  };
}

/**
 * Updates collateral claim for a token
 */
export async function updateCollateralClaim({
  tokenIdentityAddress,
  userWallet,
  amount,
  expiryDays,
  walletVerification,
  portalClient,
}: CollateralUpdateParams): Promise<{ transactionHash: string }> {
  // Calculate expiry timestamp
  const currentTime = Math.floor(Date.now() / 1000);
  const expiryTimestamp = BigInt(currentTime + expiryDays * 24 * 60 * 60);

  // Collateral topic for ERC-735 claims
  const COLLATERAL_TOPIC = "0x" + "1".padStart(64, "0");

  // Encode claim data (amount, expiry)
  const claimData = encodeAbiParameters(
    [{ type: "uint256" }, { type: "uint256" }],
    [amount, expiryTimestamp]
  );

  // Create signature hash (simplified for now)
  const messageHash = keccak256(
    encodePacked(
      ["address", "uint256", "bytes"],
      [
        tokenIdentityAddress as `0x${string}`,
        BigInt(COLLATERAL_TOPIC),
        claimData,
      ]
    )
  );

  // Issue claim via Portal GraphQL
  const result = await portalClient.mutate(
    COLLATERAL_CLAIM_MUTATION,
    {
      address: tokenIdentityAddress,
      from: userWallet,
      topic: COLLATERAL_TOPIC,
      scheme: "1", // ECDSA signature scheme
      issuer: userWallet,
      signature: messageHash,
      data: claimData,
      uri: "",
    },
    {
      sender: { wallet: userWallet },
      code: walletVerification.secretVerificationCode,
      type: walletVerification.verificationType,
    }
  );

  return { transactionHash: result.addClaim.transactionHash };
}
