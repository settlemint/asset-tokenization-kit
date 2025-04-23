import { HolderSchema } from "@/lib/queries/asset/asset-users-schema";
import { t, type StaticDecode } from "@/lib/utils/typebox";

export const CreateDvpSwapSchema = t.Object(
  {
    sender: t.EthereumAddress({
      error: "Sender address is required and must be a valid EVM address",
    }),
    amountToSend: t.Amount({
      error: "Amount to send is required",
    }),
    assetToSend: t.Object(
      {
        id: t.EthereumAddress({
          minLength: 1,
          errorMessage: "Asset to send is required",
        }),
        decimals: t.Number({
          description: "The number of decimal places for the token",
        }),
        symbol: t.String({
          description: "The symbol for the token",
        }),
        holders: t.Array(HolderSchema, {
          description: "Accounts holding this asset",
        }),
      },
      {
        description: "Asset to send",
      }
    ),
    receiver: t.EthereumAddress({
      error: "Receiver address is required and must be a valid EVM address",
    }),
    amountToReceive: t.Amount({
      error: "Amount to receive is required",
    }),
    assetToReceive: t.Object(
      {
        id: t.EthereumAddress({
          minLength: 1,
          errorMessage: "Asset to receive is required",
        }),
        decimals: t.Number({
          description: "The number of decimal places for the token",
        }),
        symbol: t.String({
          description: "The symbol for the token",
        }),
        holders: t.Array(HolderSchema, {
          description: "Accounts holding this asset",
        }),
      },
      {
        description: "Asset to receive",
      }
    ),
    expiry: t.String({
      description:
        "The time until which assets cannot be refunded from the swap.",
      error: "Expiry is required",
    }),
    secret: t.String({
      minLength: 8,
      error: "Secret must be at least 8 characters long",
    }),
  },
  {
    $id: "CreateDvpSwapForm",
    additionalProperties: false,
  }
);

export type CreateDvpSwapInput = StaticDecode<typeof CreateDvpSwapSchema>;
