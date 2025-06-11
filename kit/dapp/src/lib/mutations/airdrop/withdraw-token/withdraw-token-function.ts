"use server";

import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { WithdrawTokenFromAirdropInput } from "./withdraw-token-schema";

const PushAirdropWithdrawTokens = portalGraphql(`
  mutation PushAirdropWithdrawTokens($address: String!, $from: String!, $input: PushAirdropWithdrawTokensInput!, $challengeResponse: String!, $verificationId: String) {
    PushAirdropWithdrawTokens(
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

export const withdrawTokensFromAirdropFunction = async ({
  parsedInput: { airdrop, verificationCode, verificationType },
  ctx: { user },
}: {
  parsedInput: WithdrawTokenFromAirdropInput;
  ctx: { user: User };
}) => {
  const result = await portalClient.request(PushAirdropWithdrawTokens, {
    address: airdrop,
    from: user.wallet,
    input: {
      to: user.wallet,
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  });

  const withdrawTxHash = result.PushAirdropWithdrawTokens?.transactionHash;
  if (!withdrawTxHash) {
    throw new Error("Failed to withdraw tokens from airdrop");
  }

  return await waitForIndexingTransactions(
    safeParse(t.Hashes(), [withdrawTxHash])
  );
};
