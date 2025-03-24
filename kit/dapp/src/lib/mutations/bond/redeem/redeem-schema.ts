import { type StaticDecode, t } from "@/lib/utils/typebox";

export function RedeemBondSchema({
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
      amount: t.Amount(maxAmount, minAmount, decimals, {
        description: "The amount to redeem",
      }),
      pincode: t.Pincode({
        description: "The pincode for signing the transaction",
      }),
    },
    {
      description: "Schema for validating bond redemption inputs",
    }
  );
}

export type RedeemBondInput = StaticDecode<ReturnType<typeof RedeemBondSchema>>;
