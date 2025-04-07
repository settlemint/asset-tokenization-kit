import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating update collateral mutation inputs
 *
 * @property {string} address - The contract address
 * @property {number} amount - The new collateral amount
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} assettype - The type of asset (only stablecoin or tokenizeddeposit)
 */
export function UpdateCollateralSchema({
  decimals,
}: {
  decimals?: number;
} = {}) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      amount: t.Amount({
        decimals,
        description: "The new collateral amount",
      }),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
      assettype: t.AssetType({
        description: "The type of asset (only stablecoin or tokenizeddeposit)",
      }),
    },
    {
      description: "Schema for validating update collateral mutation inputs",
    }
  );
}

export type UpdateCollateralInput = StaticDecode<
  ReturnType<typeof UpdateCollateralSchema>
>;
