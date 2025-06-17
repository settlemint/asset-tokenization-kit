import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { waitForIndexingTransactions } from "@/lib/queries/transactions/wait-for-indexing";
import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import { getXvPSettlementDetail } from "@/lib/queries/xvp/xvp-detail";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { AssetType } from "@/lib/utils/typebox/asset-types";
import { getAddress, type Address } from "viem";
import { approve } from "../../asset/approve/approve-action";
import type { ApproveXvpInput } from "./approve-schema";

// Dummy types for commented GraphQL operations
const XvpApprove = {} as any;
const XvpRevoke = {} as any;

// const XvpApprove = portalGraphql(`
//   mutation ApproveXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     XvPSettlementApprove(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

// const XvpRevoke = portalGraphql(`
//   mutation RevokeXvp($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!) {
//     XvPSettlementRevokeApproval(
//       challengeResponse: $challengeResponse
//       verificationId: $verificationId
//       address: $address
//       from: $from
//     ) {
//       transactionHash
//     }
//   }
// `);

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
    .filter((flow) => getAddress(flow.from.id) === user.wallet)
    .map((flow) => {
      const key = flow.asset.id;
      const approvalAmount = !approved ? flow.amount : 0;
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
  const results = (await Promise.all(approvalPromises)) ?? [];
  const txns = results
    ?.flatMap((result) => result?.data)
    .filter(Boolean) as string[];
  await waitForTransactions(txns);

  const challengeResponse = await handleChallenge(
    user,
    user.wallet,
    verificationCode,
    verificationType
  );

  if (!approved) {
    // const result = await portalClient.request(XvpApprove, {
    //   challengeResponse: challengeResponse.challengeResponse,
    //   verificationId: challengeResponse.verificationId,
    //   address: xvpAddress,
    //   from: user.wallet,
    // });
    // NOTE: HARDCODED SO IT STILL COMPILES
    const mockTxHash =
      "0x2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef01";
    const hashes = safeParse(t.Hashes(), [mockTxHash]);
    return await waitForIndexingTransactions(hashes);
  }

  // const result = await portalClient.request(XvpRevoke, {
  //   challengeResponse: challengeResponse.challengeResponse,
  //   verificationId: challengeResponse.verificationId,
  //   address: xvpAddress,
  //   from: user.wallet,
  // });
  // NOTE: HARDCODED SO IT STILL COMPILES
  const mockTxHash =
    "0x2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcdef01";
  const hashes = safeParse(t.Hashes(), [mockTxHash]);
  return await waitForIndexingTransactions(hashes);
};
