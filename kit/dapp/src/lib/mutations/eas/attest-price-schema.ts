import { t, type StaticDecode } from "@/lib/utils/typebox";

export function AttestPriceSchema() {
  return t.Object(
    {
      asset: t.EthereumAddress({
        description: "The address of the asset",
      }),
      price: t.Price({
        description: "Price of the tokenized deposit",
      }),
      currency: t.FiatCurrency({
        description: "Currency of the price",
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
      description: "Schema for creating an EAS attestation for a price",
    }
  );
}

export type AttestPriceInput = StaticDecode<
  ReturnType<typeof AttestPriceSchema>
>;
