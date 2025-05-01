import { HolderSchema } from "@/lib/queries/asset/asset-users-schema";
import { t, type StaticDecode } from "@/lib/utils/typebox";

export const CreateXvpSchema = t.Object(
  {
    offerAmount: t.Amount({
      error: "Amount to send is required",
    }),
    offerAsset: t.Object(
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
    user: t.EthereumAddress({
      error: "Receiver address is required and must be a valid EVM address",
    }),
    requestAmount: t.Amount({
      error: "Amount to receive is required",
    }),
    requestAsset: t.Object(
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
        "The time until which assets cannot be refunded from the settlement.",
      error: "Expiry is required",
    }),
    autoExecute: t.Boolean({
      description:
        "Whether to automatically execute the settlement on last approval",
    }),
  },
  {
    $id: "CreateXvpForm",
    additionalProperties: false,
  }
);

export type CreateXvpInput = StaticDecode<typeof CreateXvpSchema>;
