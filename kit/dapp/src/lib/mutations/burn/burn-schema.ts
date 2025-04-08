import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating burn mutation inputs
 *
 * @property {string} address - The contract address
 * @property {number} amount - The amount of tokens to burn
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset
 */
export function BurnSchema({
  maxAmount,
  decimals,
}: {
  maxAmount?: number;
  decimals?: number;
} = {}) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address of the asset",
      }),
      amount: t.Amount({
        max: maxAmount,
        decimals,
        description: "The amount of tokens to burn",
      }),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
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
