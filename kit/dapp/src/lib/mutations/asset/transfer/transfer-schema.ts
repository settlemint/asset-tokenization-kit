import { type StaticDecode, t } from "@/lib/utils/typebox";

export function getTransferFormSchema(balance?: string) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address of the asset",
      }),
      to: t.EthereumAddress({
        description: "The recipient address",
      }),
      value: balance
        ? t.Number({
            description: "The amount to transfer",
            minimum: 1,
            maximum: Number(balance),
            errorMessage: `Amount cannot be greater than balance ${balance}`,
          })
        : t.Number({
            description: "The amount to transfer",
            minimum: 0,
          }),
      assetType: t.AssetType({
        description: "The type of asset to transfer",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      decimals: t.Decimals({
        description: "The number of decimal places for the token",
      }),
    },
    {
      description: "Schema for validating transfer inputs",
    }
  );
}

export type TransferFormSchema = ReturnType<typeof getTransferFormSchema>;
export type TransferFormType = StaticDecode<TransferFormSchema>;
export type TransferFormAssetType =
  StaticDecode<TransferFormSchema>["assetType"];
