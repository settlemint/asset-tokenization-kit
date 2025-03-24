import { type StaticDecode, t } from "@/lib/utils/typebox";

export function getTransferFormSchema({
  balance,
  minAmount,
  decimals,
}: {
  balance?: string;
  minAmount?: number;
  decimals?: number;
} = {}) {
  const maxAmount = balance ? Number(balance) : undefined;
  const min = minAmount ? minAmount : decimals ? 10 ** -decimals : 1;

  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address of the asset",
      }),
      to: t.EthereumAddress({
        description: "The recipient address",
      }),
      value: t.Amount(maxAmount, min, decimals, {
        description: "The amount to transfer",
        errorMessage: balance
          ? `Amount cannot be greater than balance ${balance}`
          : undefined,
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
