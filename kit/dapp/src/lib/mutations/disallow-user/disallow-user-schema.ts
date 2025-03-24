import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating disallow user mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} userAddress - The address of the user to disallow
 * @property {string} assettype - The type of asset
 */
export function DisallowUserSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      userAddress: t.EthereumAddress({
        description: "The address of the user to disallow",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating disallow user mutation inputs",
    }
  );
}

export type DisallowUserInput = StaticDecode<
  ReturnType<typeof DisallowUserSchema>
>;
