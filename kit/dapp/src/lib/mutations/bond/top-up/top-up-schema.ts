import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating top up underlying asset mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {string} target - Whether to top up the bond or yield schedule
 * @property {string} targetAddress - The address to top up (bond or yield schedule)
 * @property {string} underlyingAssetAddress - The address of the underlying asset contract
 * @property {number} amount - The amount of underlying asset to top up
 * @property {string} pincode - The pincode for signing the transaction
 */
export function TopUpSchema({
  decimals,
}: {
  decimals?: number;
} = {}) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The bond contract address",
      }),
      target: t.Union([t.Literal("bond"), t.Literal("yield")], {
        description: "Whether to top up the bond or yield schedule",
      }),
      targetAddress: t.EthereumAddress({
        description: "The address to top up (bond or yield schedule)",
      }),
      underlyingAssetAddress: t.EthereumAddress({
        description: "The address of the underlying asset contract",
      }),
      underlyingAssetType: t.AssetType({
        description:
          "The type of the underlying asset (bond or yield schedule)",
      }),
      amount: t.Amount({
        decimals,
        description: "The amount of underlying asset to top up",
      }),
      verificationCode: t.Union([t.TwoFactorCode(), t.Pincode()], {
        description:
          "The two factor code or pincode for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
    },
    {
      description: "Schema for validating top up underlying asset inputs",
    }
  );
}

export type TopUpInput = StaticDecode<ReturnType<typeof TopUpSchema>>;
