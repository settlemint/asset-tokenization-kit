import type { User } from "@/lib/auth/types";
import { handleChallenge } from "@/lib/challenge";
import { XVP_SETTLEMENT_FACTORY_ADDRESS } from "@/lib/contracts";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { formatDate } from "@/lib/utils/date";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CreateXvpInput } from "./create-schema";

const XvpFactoryCreate = portalGraphql(`
  mutation XvPSettlementFactoryCreate($challengeResponse: String!, $verificationId: String, $address: String!, $from: String!, $input: XvPSettlementFactoryCreateInput!) {
    XvPSettlementFactoryCreate(
      challengeResponse: $challengeResponse
      verificationId: $verificationId
      address: $address
      from: $from
      input: $input
    ) {
      transactionHash
    }
  }
`);

export const createXvpFunction = async ({
  parsedInput: {
    offerAsset,
    offerAmount,
    requestAsset,
    requestAmount,
    user: receiver,
    expiry,
    autoExecute,
    verificationCode,
    verificationType,
  },
  ctx: { user },
}: {
  parsedInput: CreateXvpInput;
  ctx: { user: User };
}) => {
  const offerAssetId = offerAsset.id;
  const offerAssetDecimals = offerAsset.decimals;
  const requestAssetId = requestAsset.id;
  const requestAssetDecimals = requestAsset.decimals;

  const result = await portalClient.request(XvpFactoryCreate, {
    address: XVP_SETTLEMENT_FACTORY_ADDRESS,
    from: user.wallet,
    input: {
      autoExecute,
      cutoffDate: formatDate(expiry, {
        type: "unixSeconds",
      }),
      flows: [
        {
          from: user.wallet,
          to: receiver,
          asset: offerAssetId,
          amount: (
            BigInt(offerAmount) * BigInt(10 ** offerAssetDecimals)
          ).toString(),
        },
        {
          from: receiver,
          to: user.wallet,
          asset: requestAssetId,
          amount: (
            BigInt(requestAmount) * BigInt(10 ** requestAssetDecimals)
          ).toString(),
        },
      ],
    },
    ...(await handleChallenge(
      user,
      user.wallet,
      verificationCode,
      verificationType
    )),
  });

  const createTxHash = result.XvPSettlementFactoryCreate?.transactionHash;
  if (!createTxHash) {
    throw new Error("Failed to create XVP: no transaction hash received");
  }
  return safeParse(t.Hashes(), [createTxHash]);
};
