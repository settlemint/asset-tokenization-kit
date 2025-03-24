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
  maxAmount,
  minAmount,
  decimals,
}: {
  maxAmount?: number;
  minAmount?: number;
  decimals?: number;
} = {}) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The contract address",
      }),
      amount: t.Amount(maxAmount, minAmount, decimals, {
        description: "The new collateral amount",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
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
