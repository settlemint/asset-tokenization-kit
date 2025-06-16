import { type StaticDecode, t } from "@/lib/utils/typebox";

export function RedeemBondSchema({
  decimals,
}: {
  decimals?: number;
} = {}) {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The bond contract address",
      }),
      amount: t.Amount({
        decimals,
        description: "The amount to redeem",
      }),
      verificationCode: t.VerificationCode({
        description:
          "The verification code (PIN, 2FA, or secret code) for signing the transaction",
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
