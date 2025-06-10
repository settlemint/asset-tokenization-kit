"use server";

import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getAirdropDistribution } from "@/lib/queries/airdrop/airdrop-distribution";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { createMerkleTree, getMerkleProof } from "../create/common/merkle-tree";
import type { DistributeInput } from "./batch-distribute-schema";

const PushAirdropBatchDistribute = portalGraphql(`
mutation PushAirdropBatchDistribute($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: PushAirdropBatchDistributeInput!) {
  PushAirdropBatchDistribute(
    challengeResponse: $challengeResponse
    verificationId: $verificationId
    address: $address
    from: $from
    input: $input
  ) {
    transactionHash
  }
}
`);

const MAX_BATCH_SIZE = 100;

export const batchDistributeFunction = async ({
  parsedInput: { airdrop, verificationCode, verificationType },
  ctx: { user },
}: {
  parsedInput: DistributeInput;
  ctx: { user: User };
}) => {
  const distributions = await getAirdropDistribution(airdrop);

  if (distributions.length === 0) {
    return [];
  }

  const tree = createMerkleTree(distributions);

  const transactionHashes: string[] = [];

  for (let i = 0; i < distributions.length; i += MAX_BATCH_SIZE) {
    const batch = distributions.slice(i, i + MAX_BATCH_SIZE);
    const recipients = batch.map((d) => d.recipient);
    const amounts = batch.map((d) => d.amountExact.toString());

    // TODO: remove any when portal fix https://github.com/settlemint/portal/pull/1263 is merged and released
    const merkleProofs: any = batch.map((recipientData) =>
      getMerkleProof(
        {
          ...recipientData,
          amount: Number(recipientData.amount),
          amountExact: BigInt(recipientData.amountExact),
        },
        tree
      )
    );
    // TODO: remove this when portal fix https://github.com/settlemint/portal/pull/1263 is merged and released
    const wrappedMerkleProofs = merkleProofs.map((proof: string[]) => [proof]);

    console.log("wrappedMerkleProofs", wrappedMerkleProofs);

    const result = await portalClient.request(PushAirdropBatchDistribute, {
      address: airdrop,
      from: user.wallet,
      input: {
        recipients,
        amounts,
        merkleProofs: wrappedMerkleProofs,
      },
      ...(await handleChallenge(
        user,
        user.wallet,
        verificationCode,
        verificationType
      )),
    });

    const transactionHash = result.PushAirdropBatchDistribute?.transactionHash;
    if (!transactionHash) {
      throw new Error(
        `Failed to retrieve transaction hash for batch starting at index ${i}`
      );
    }
    transactionHashes.push(transactionHash);
  }

  return await waitForIndexingTransactions(
    safeParse(t.Hashes(), transactionHashes)
  );
};
