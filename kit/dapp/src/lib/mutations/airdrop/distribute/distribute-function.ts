"use server";

import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import { parseUnits } from "viem";
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
    amount,
    recipient,
    merkleProof,
    verificationCode,
    verificationType,
  },
  ctx: { user },
}: {
  parsedInput: DistributeInput;
  ctx: { user: User };
}) => {
  const result = await portalClient.request(PushAirdropDistribute, {
    address,
    from: user.wallet,
    input: {
      recipient,
      merkleProof,
      amount: parseUnits(amount.toString(), decimals).toString(),
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  });

  const txHash = result.PushAirdropDistribute?.transactionHash;
  if (!txHash) {
    throw new Error(
      "Failed to distribute tokens: no transaction hash received"
    );
  }

  const hashes = safeParse(t.Hashes(), [txHash]);
  return hashes;
};
