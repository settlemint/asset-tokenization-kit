import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating generic mint mutation inputs
 *
 * @property {string} address - The contract address
 * @property {number} amount - The amount of tokens to mint
 * @property {string} to - The recipient address
 * @property {string} pincode - User's pincode for authentication
 * @property {string} assetType - The type of asset
 */
export function MintSchema(
  maxAmount?: number,
  minAmount?: number,
  decimals?: number
) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      amount: t.Amount(maxAmount, minAmount, decimals, {
        description: "The amount of tokens to mint",
      }),
      to: t.EthereumAddress({
        description: "The recipient address",
      }),
      pincode: t.Pincode({
        description: "User's pincode for authentication",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating generic mint mutation inputs",
    }
  );
}

export type MintInput = StaticDecode<ReturnType<typeof MintSchema>>;
