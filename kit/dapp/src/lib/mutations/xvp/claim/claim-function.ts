import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { ClaimXvpInput } from "./claim-schema";

const ClaimXvp = portalGraphql(`
  mutation ClaimXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
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

export const claimXvpFunction = async ({
  parsedInput: { verificationCode, verificationType, xvp },
  ctx: { user },
}: {
  parsedInput: ClaimXvpInput;
  ctx: { user: User };
}) => {
  const challengeResponse = await handleChallenge(
    user,
    user.wallet,
    verificationCode,
    verificationType
  );

  const result = await portalClient.request(ClaimXvp, {
    challengeResponse: challengeResponse.challengeResponse,
    verificationId: challengeResponse.verificationId,
    address: xvp,
    from: user.wallet,
  });
  if (!result.XvPSettlementExecute) {
    throw new Error("Failed to claim XVP");
  }
  return safeParse(t.Hashes(), [result.XvPSettlementExecute.transactionHash]);
};
