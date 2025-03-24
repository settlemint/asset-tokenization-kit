import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating transfer mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} to - The recipient address
 * @property {number} value - The amount to transfer
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export function TransferSchema({
  maxAmount,
  minAmount,
  decimals,
}: {
  maxAmount?: number;
  minAmount?: number;
  decimals?: number;
} = {}) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      to: t.EthereumAddress({
        description: "The recipient address",
      }),
      value: t.Amount(maxAmount, minAmount, decimals, {
        description: "The amount to transfer",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating transfer mutation inputs",
    }
  );
}

export type TransferInput = StaticDecode<ReturnType<typeof TransferSchema>>;
