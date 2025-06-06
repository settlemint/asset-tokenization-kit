"use server";

import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
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
  parsedInput: {
    address,
    decimals,
    recipient,
    distribution,
    verificationCode,
    verificationType,
  },
  ctx: { user },
}: {
  parsedInput: DistributeInput;
  ctx: { user: User };
}) => {
  const recipientData = distribution.find((d) => d.recipient === recipient);

  if (!recipientData) {
    throw new Error("Recipient not found in distribution list");
  }

  const merkleProof = getMerkleProof(
    {
      ...recipientData,
      amount: Number(recipientData.amount),
      amountExact: BigInt(recipientData.amountExact),
    },
    createMerkleTree(
      distribution.map((d) => ({
        ...d,
        amount: Number(d.amount),
        amountExact: BigInt(d.amountExact),
      }))
    )
  );

  const result = await portalClient.request(PushAirdropDistribute, {
    address,
    from: user.wallet,
    input: {
      recipient,
      merkleProof,
      amount: parseUnits(recipientData.amount.toString(), decimals).toString(),
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
