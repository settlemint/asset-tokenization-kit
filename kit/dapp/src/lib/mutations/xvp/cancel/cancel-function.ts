import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { approve } from "@/lib/mutations/asset/approve/approve-action";
import { getXvPSettlementDetail } from "@/lib/queries/xvp/xvp-detail";
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
  parsedInput: { verificationCode, verificationType, xvp: xvpAddress },
  ctx: { user },
}: {
  parsedInput: CancelXvpInput;
  ctx: { user: User };
}) => {
  const xvp = await getXvPSettlementDetail(xvpAddress, user.currency);
  const assets = new Set(
    xvp.flows
      .filter((flow) => flow.from.id === user.wallet)
      .map((flow) => flow.asset)
  );

  const approvalPromises = Array.from(assets).map((asset) =>
    approve({
      address: asset.id,
      assettype: asset.type,
      amount: 0,
      spender: xvpAddress,
      verificationCode,
      verificationType,
    })
  );
  await Promise.all(approvalPromises);

  const challengeResponse = await handleChallenge(
    user,
    user.wallet,
    verificationCode,
    verificationType
  );

  const result = await portalClient.request(CancelXvp, {
    challengeResponse: challengeResponse.challengeResponse,
    verificationId: challengeResponse.verificationId,
    address: xvpAddress,
    from: user.wallet,
  });
  if (!result.XvPSettlementCancel) {
    throw new Error("Failed to cancel XVP");
  }
  return safeParse(t.Hashes(), [result.XvPSettlementCancel.transactionHash]);
};
