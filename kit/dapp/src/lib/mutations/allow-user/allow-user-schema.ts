import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating allow user mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} userAddress - The address of the user to allow
 * @property {string} assettype - The type of asset
 */
export function AllowUserSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      verificationCode: t.Union([t.TwoFactorCode(), t.Pincode()], {
        description:
          "The two factor code or pincode for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
      userAddress: t.EthereumAddress({
        description: "The address of the user to allow",
      }),
      assettype: t.AssetType({
        description: "The type of asset",
      }),
    },
    {
      description: "Schema for validating allow user mutation inputs",
    }
  );
}

export type AllowUserInput = StaticDecode<ReturnType<typeof AllowUserSchema>>;
