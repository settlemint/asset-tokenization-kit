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
export function FreezeSchema({
  maxAmount,
  decimals,
}: {
  maxAmount?: number;
  decimals?: number;
} = {}) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      userAddress: t.EthereumAddress({
        description: "The address of the user to freeze",
      }),
      amount: t.Amount({
        max: maxAmount,
        decimals,
        description: "The amount to freeze",
      }),
      verificationCode: t.Union([t.TwoFactorCode(), t.Pincode()], {
        description:
          "The two factor code or pincode for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
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
