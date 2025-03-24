import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating freeze account mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} userAddress - The address of the user to freeze
 * @property {number} amount - The amount to freeze
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export function FreezeSchema(
  maxAmount?: number,
  minAmount?: number,
  decimals?: number
) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      userAddress: t.EthereumAddress({
        description: "The address of the user to freeze",
      }),
      amount: t.Amount(maxAmount, minAmount, decimals, {
        description: "The amount to freeze",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating freeze account mutation inputs",
    }
  );
}

export type FreezeInput = StaticDecode<ReturnType<typeof FreezeSchema>>;
