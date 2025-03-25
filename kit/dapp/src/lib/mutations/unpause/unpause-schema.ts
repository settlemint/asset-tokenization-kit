import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating unpause mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export function UnpauseSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating unpause mutation inputs",
    }
  );
}

export type UnpauseInput = StaticDecode<ReturnType<typeof UnpauseSchema>>;
