import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAirdropDistribution } from "@/lib/queries/airdrop/airdrop-distribution";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { safeParse, t } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { createMerkleTree, getMerkleProof } from "../create/common/merkle-tree";
import type { ClaimAirdropInput } from "./claim-schema";

/**
 * GraphQL mutation for claiming a standard airdrop
 */
const ClaimStandardAirdrop = portalGraphql(`
  mutation ClaimStandardAirdrop(
    $address: String!
    $from: String!
    $input: StandardAirdropClaimInput!
    $challengeResponse: String!
    $verificationId: String
  ) {
    StandardAirdropClaim(
      address: $address
      from: $from
      input: $input
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * GraphQL mutation for claiming a vesting airdrop
 */
const ClaimVestingAirdrop = portalGraphql(`
  mutation ClaimVestingAirdrop(
    $address: String!
    $from: String!
    $input: VestingAirdropClaimInput!
    $challengeResponse: String!
    $verificationId: String
  ) {
    VestingAirdropClaim(
      address: $address
      from: $from
      input: $input
      challengeResponse: $challengeResponse
      verificationId: $verificationId
    ) {
      transactionHash
    }
  }
`);

/**
 * Function to claim airdrop for both standard and vesting types
 *
 * @param input - Validated input containing airdrop details and type
 * @param user - The user executing the claim operation
 * @returns Array of transaction hashes
 */
export const claimAirdropFunction = async ({
  parsedInput: {
    airdrop,
    airdropType,
    amount,
    index,
    recipient,
    amountExact,
    verificationCode,
    verificationType,
  },
  ctx: { user },
}: {
  parsedInput: ClaimAirdropInput;
  ctx: { user: User };
}) => {
  // Get all distributions for this airdrop to build the merkle tree
  const distributions = await getAirdropDistribution(airdrop);

  // Create the merkle tree from all distributions
  const tree = createMerkleTree(distributions);

  // Get the merkle proof for this specific leaf
  const merkleProof = getMerkleProof(
    {
      index,
      amount: Number(amount),
      amountExact: BigInt(amountExact),
      recipient,
    },
    tree
  );

  const baseParams:
    | VariablesOf<typeof ClaimStandardAirdrop>
    | VariablesOf<typeof ClaimVestingAirdrop> = {
    address: airdrop,
    from: user.wallet,
    input: {
      amount: amountExact.toString(),
      index: index.toString(),
      merkleProof,
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  };

  switch (airdropType) {
    case "standard": {
      const response = await portalClient.request(
        ClaimStandardAirdrop,
        baseParams
      );

      return await waitForIndexingTransactions(
        safeParse(t.Hashes(), [response.StandardAirdropClaim?.transactionHash])
      );
    }
    case "vesting": {
      const response = await portalClient.request(
        ClaimVestingAirdrop,
        baseParams
      );
      return await waitForIndexingTransactions(
        safeParse(t.Hashes(), [response.VestingAirdropClaim?.transactionHash])
      );
    }
    case "push": {
      throw new Error("Push airdrops do not support manual claiming");
    }
    default:
      exhaustiveGuard(airdropType);
  }
};
