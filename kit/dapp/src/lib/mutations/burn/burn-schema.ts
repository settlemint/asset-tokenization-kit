import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating burn mutation inputs
 *
 * @property {string} address - The contract address
 * @property {number} amount - The amount of tokens to burn
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export function BurnSchema(max?: number, decimals?: number) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address of the asset",
      }),
      amount: t.Number({
        description: "The amount of tokens to burn",
        minimum: 0,
        maximum: max,
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      assettype: t.AssetType({
        description: "The type of asset to burn",
      }),
    },
    {
      description: "Schema for validating burn mutation inputs",
    }
  );
}

export type BurnInput = StaticDecode<ReturnType<typeof BurnSchema>>;
