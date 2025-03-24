import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating unblock user mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} userAddress - The address of the user to unblock
 * @property {string} assettype - The type of asset
 */
export function UnblockUserSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      userAddress: t.EthereumAddress({
        description: "The address of the user to unblock",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating unblock user mutation inputs",
    }
  );
}

export type UnblockUserInput = StaticDecode<
  ReturnType<typeof UnblockUserSchema>
>;
