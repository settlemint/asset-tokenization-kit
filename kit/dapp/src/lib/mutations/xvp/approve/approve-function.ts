import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { getXvPSettlementDetail } from "@/lib/queries/xvp/xvp-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import type { Address } from "viem";
import { approve } from "../../asset/approve/approve-action";
import type { ApproveXvpInput } from "./approve-schema";

const XvpApprove = portalGraphql(`
  mutation ApproveXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
    XvPSettlementApprove(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

const XvpRevoke = portalGraphql(`
  mutation RevokeXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
    XvPSettlementRevokeApproval(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
    ) {
      transactionHash
    }
  }
`);

export const approveXvpFunction = async ({
  parsedInput: {
    approved,
    verificationCode,
    verificationType,
    xvp: xvpAddress,
  },
  ctx: { user },
}: {
  parsedInput: ApproveXvpInput;
  ctx: { user: User };
}) => {
  const xvp = await getXvPSettlementDetail(xvpAddress, user.currency);
  const assetsSentMap = new Map<
    Address,
    { address: Address; amount: number; assettype: AssetType }
  >();
  xvp.flows
    .filter((flow) => flow.from.id === user.wallet)
    .map((flow) => {
      const key = flow.asset.id;
      const approvalAmount = approved ? flow.amount : 0;
      if (!assetsSentMap.has(key)) {
        assetsSentMap.set(key, {
          address: key,
          amount: approvalAmount,
          assettype: flow.asset.type,
        });
      } else {
        assetsSentMap.get(key)!.amount += approvalAmount;
      }
    });
  const approvalPromises = Array.from(assetsSentMap.values()).map((asset) =>
    approve({
      address: asset.address,
      assettype: asset.assettype,
      amount: asset.amount,
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

  if (approved) {
    const result = await portalClient.request(XvpApprove, {
      challengeResponse: challengeResponse.challengeResponse,
      verificationId: challengeResponse.verificationId,
      address: user.wallet,
      from: user.wallet,
    });
    if (!result.XvPSettlementApprove) {
      throw new Error("Failed to approve XVP");
    }
    return safeParse(t.Hashes(), [result.XvPSettlementApprove.transactionHash]);
  }

  const result = await portalClient.request(XvpRevoke, {
    challengeResponse: challengeResponse.challengeResponse,
    verificationId: challengeResponse.verificationId,
    address: user.wallet,
    from: user.wallet,
  });
  if (!result.XvPSettlementRevokeApproval) {
    throw new Error("Failed to revoke XVP");
  }
  return safeParse(t.Hashes(), [
    result.XvPSettlementRevokeApproval.transactionHash,
  ]);
};
