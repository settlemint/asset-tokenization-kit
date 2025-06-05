import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAirdropDistribution } from "@/lib/queries/airdrop/airdrop-distribution";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import {
  createMerkleTree,
  getMerkleProof,
} from "../../create/common/merkle-tree";
import type { ClaimStandardAirdropInput } from "./create-schema";

const ClaimStandardAirdrop = portalGraphql(`
  mutation ClaimStandardAirdrop($address: String!, $from: String!, $input: StandardAirdropClaimInput!, $challengeResponse: String!, $verificationId: String) {
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

export const claimStandardAirdropFunction = async ({
  parsedInput: {
    airdrop,
    amount,
    index,
    recipient,
    amountExact,
    verificationCode,
    verificationType,
  },
  ctx: { user },
}: {
  parsedInput: ClaimStandardAirdropInput;
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

  const result = await portalClient.request(ClaimStandardAirdrop, {
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
  });

  const claimTxHash = result.StandardAirdropClaim?.transactionHash;
  if (!claimTxHash) {
    throw new Error("Failed to claim airdrop");
  }

  return await waitForIndexingTransactions(
    safeParse(t.Hashes(), [claimTxHash])
  );
};
