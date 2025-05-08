import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
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
  parsedInput: { approved, verificationCode, verificationType },
  ctx: { user },
}: {
  parsedInput: ApproveXvpInput;
  ctx: { user: User };
}) => {
  // TODO: grant approval for all types of tokens
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
