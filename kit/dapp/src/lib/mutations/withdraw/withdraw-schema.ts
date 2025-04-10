import { t, type StaticDecode } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating withdraw underlying asset mutation inputs
 *
 * @property {string} address - The contract address
 * @property {string} targetAddress - The target contract address
 * @property {string} to - The recipient address
 * @property {number} amount - The amount of underlying asset to withdraw
 * @property {string} pincode - The pincode for signing the transaction
 * @property {string} underlyingAssetAddress - The address of the underlying asset
 * @property {string} underlyingAssetType - The type of the underlying asset
 * @property {string} assettype - The type of asset
 * @property {string} target - The target type (bond or yield)
 */
export function WithdrawSchema({
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
      assettype: t.AssetType({
        description: "The type of asset",
      }),
      targetAddress: t.EthereumAddress({
        description: "The target contract address",
      }),
      to: t.EthereumAddress({
        description: "The recipient address",
      }),
      amount: t.Amount({
        max: maxAmount,
        decimals,
        description: "The amount of underlying asset to withdraw",
      }),
      underlyingAssetAddress: t.EthereumAddress({
        description: "The address of the underlying asset",
      }),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
      target: t.Union([t.Literal("bond"), t.Literal("yield")], {
        description: "The target type (bond or yield)",
      }),
    },
    {
      description:
        "Schema for validating withdraw underlying asset mutation inputs",
    }
  );
}

export type WithdrawInput = StaticDecode<ReturnType<typeof WithdrawSchema>>;
