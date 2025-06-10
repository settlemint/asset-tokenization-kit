"use server";

import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAirdropDistribution } from "@/lib/queries/airdrop/airdrop-distribution";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { createMerkleTree, getMerkleProof } from "../create/common/merkle-tree";
import type { DistributeInput } from "./distribute-schema";

const PushAirdropDistribute = portalGraphql(`
mutation PushAirdropDistribute($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: PushAirdropDistributeInput!) {
  PushAirdropDistribute(
    address: $address
    from: $from
    challengeResponse: $challengeResponse
    verificationId: $verificationId
    input: $input
  ) {
    transactionHash
  }
}
`);

export const distributeFunction = async ({
  parsedInput: { airdrop, recipient, verificationCode, verificationType },
  ctx: { user },
}: {
  parsedInput: DistributeInput;
  ctx: { user: User };
}) => {
  // Get all distributions for this airdrop and build the merkle tree
  const distributions = await getAirdropDistribution(airdrop);
  const tree = createMerkleTree(distributions);

  const recipientData = distributions.find((d) => d.recipient === recipient);
  if (!recipientData) {
    throw new Error("Recipient not found in distribution list");
  }

  const merkleProof = getMerkleProof(
    {
      ...recipientData,
      amount: Number(recipientData.amount),
      amountExact: BigInt(recipientData.amountExact),
    },
    tree
  );

  const result = await portalClient.request(PushAirdropDistribute, {
    address: airdrop,
    from: user.wallet,
    input: {
      recipient,
      merkleProof,
      amount: recipientData.amountExact.toString(),
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  });

  const transactionHash = result.PushAirdropDistribute?.transactionHash;
  if (!transactionHash) {
    throw new Error("Failed to retrieve transaction hash");
  }

  return await waitForIndexingTransactions(
    safeParse(t.Hashes(), [transactionHash])
  );
};
