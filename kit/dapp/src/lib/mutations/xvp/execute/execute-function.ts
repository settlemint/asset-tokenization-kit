import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { ExecuteXvpInput } from "./execute-schema";

const ExecuteXvp = portalGraphql(`
  mutation ExecuteXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
    XvPSettlementExecute(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

export const executeXvpFunction = async ({
  parsedInput: { verificationCode, verificationType, xvp },
  ctx: { user },
}: {
  parsedInput: ExecuteXvpInput;
  ctx: { user: User };
}) => {
  const challengeResponse = await handleChallenge(
    user,
    user.wallet,
    verificationCode,
    verificationType
  );

  const result = await portalClient.request(ExecuteXvp, {
    challengeResponse: challengeResponse.challengeResponse,
    verificationId: challengeResponse.verificationId,
    address: xvp,
    from: user.wallet,
  });
  if (!result.XvPSettlementExecute) {
    throw new Error("Failed to execute XVP");
  }
  return waitForIndexingTransactions(
    safeParse(t.Hashes(), [result.XvPSettlementExecute.transactionHash])
  );
};
