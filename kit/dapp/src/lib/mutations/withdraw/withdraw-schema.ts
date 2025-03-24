import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating withdraw underlying asset mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} to - The recipient address
 * @property {number} amount - The amount of underlying asset to withdraw
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} underlyingAssetAddress - The address of the underlying asset
 * @property {string} assettype - The type of asset
 */
export function WithdrawSchema({
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
      amount: t.Amount(maxAmount, minAmount, decimals, {
        description: "The amount of underlying asset to withdraw",
      }),
      underlyingAssetAddress: t.EthereumAddress({
        description: "The address of the underlying asset",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description:
        "Schema for validating withdraw underlying asset mutation inputs",
    }
  );
}

export type WithdrawInput = StaticDecode<ReturnType<typeof WithdrawSchema>>;
