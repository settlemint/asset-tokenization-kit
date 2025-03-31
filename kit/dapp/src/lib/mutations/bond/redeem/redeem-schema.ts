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
      verificationCode: t.Union([t.TwoFactorCode(), t.Pincode()], {
        description:
          "The two factor code or pincode for signing the transaction",
      }),
      verificationType: t.VerificationType({
        description: "The type of verification",
      }),
    },
    {
      description: "Schema for validating bond redemption inputs",
    }
  );
}

export type RedeemBondInput = StaticDecode<ReturnType<typeof RedeemBondSchema>>;
