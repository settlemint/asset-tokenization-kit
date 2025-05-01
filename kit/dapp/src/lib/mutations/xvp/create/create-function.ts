import type { User } from "@/lib/auth/types";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { safeParse, t } from "@/lib/utils/typebox";
import type { CreateXvpInput } from "./create-schema";

const XvpFactoryCreate = portalGraphql(`
  mutation XvPSettlementFactoryCreate($address: String!, $from: String!, $input: XvPSettlementFactoryCreateInput!) {
    XvPSettlementFactoryCreate(
      address: $address
      from: $from
      input: $input
    ) {
      transactionHash
    }
  }
`);

export const createXvpFunction = async ({
  parsedInput,
  ctx: { user },
}: {
  parsedInput: CreateXvpInput;
  ctx: { user: User };
}) => {
  const {
    offerAsset,
    offerAmount,
    requestAsset,
    requestAmount,
    user: receiver,
    expiry,
    autoExecute,
  } = parsedInput;

  const offerAssetId = offerAsset.id;
  const offerAssetDecimals = offerAsset.decimals;
  const requestAssetId = requestAsset.id;
  const requestAssetDecimals = requestAsset.decimals;

  const result = await portalClient.request(XvpFactoryCreate, {
    address: "",
    from: user.wallet,
    input: {
      autoExecute,
      cutoffDate: expiry,
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
  });

  const createTxHash = result.XvPSettlementFactoryCreate?.transactionHash;
  if (!createTxHash) {
    throw new Error("Failed to create XVP: no transaction hash received");
  }

  return safeParse(t.Hashes(), [createTxHash]);
};
