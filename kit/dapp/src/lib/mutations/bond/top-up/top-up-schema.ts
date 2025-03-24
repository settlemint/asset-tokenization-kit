import { type StaticDecode, t } from "@/lib/utils/typebox";

/**
 * TypeBox schema for validating top up underlying asset mutation inputs
 *
 * @property {string} address - The bond contract address
 * @property {number} amount - The amount of underlying asset to top up
 * @property {string} underlyingAssetAddress - The address of the underlying asset contract
 * @property {string} pincode - The pincode for signing the transaction
 */
export function TopUpSchema({
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
        description: "The bond contract address",
      }),
      underlyingAssetAddress: t.EthereumAddress({
        description: "The address of the underlying asset contract",
      }),
      amount: t.Amount(maxAmount, minAmount, decimals, {
        description: "The amount of underlying asset to top up",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
    },
    {
      description: "Schema for validating top up underlying asset inputs",
    }
  );
}

export type TopUpInput = StaticDecode<ReturnType<typeof TopUpSchema>>;
