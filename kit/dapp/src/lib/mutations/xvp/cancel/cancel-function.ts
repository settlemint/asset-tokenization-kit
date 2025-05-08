import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CancelXvpInput } from "./cancel-schema";

const CancelXvp = portalGraphql(`
  mutation CancelXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
    XvPSettlementCancel(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

export const cancelXvpFunction = async ({
  parsedInput: { verificationCode, verificationType, xvp },
  ctx: { user },
}: {
  parsedInput: CancelXvpInput;
  ctx: { user: User };
}) => {
  const challengeResponse = await handleChallenge(
    user,
    user.wallet,
    verificationCode,
    verificationType
  );

  const result = await portalClient.request(CancelXvp, {
    challengeResponse: challengeResponse.challengeResponse,
    verificationId: challengeResponse.verificationId,
    address: xvp,
    from: user.wallet,
  });
  if (!result.XvPSettlementCancel) {
    throw new Error("Failed to cancel XVP");
  }
  return safeParse(t.Hashes(), [result.XvPSettlementCancel.transactionHash]);
};
