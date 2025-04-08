import { type StaticDecode, t } from "@/lib/utils/typebox";

export function MatureFormSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The bond contract address to mature",
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
      description: "Schema for validating bond maturity inputs",
    }
  );
}

export type MatureFormInput = StaticDecode<ReturnType<typeof MatureFormSchema>>;
