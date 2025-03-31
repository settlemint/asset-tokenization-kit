import { type StaticDecode, t } from "@/lib/utils/typebox";

export function MatureFormSchema() {
  return t.Object(
    {
      address: t.EthereumAddress({
        description: "The bond contract address to mature",
      }),
      verificationCode: t.Union([t.TwoFactorCode(), t.Pincode()], {
        description:
          "The two factor code or pincode for signing the transaction",
      }),
    },
    {
      description: "Schema for validating bond maturity inputs",
    }
  );
}

export type MatureFormInput = StaticDecode<ReturnType<typeof MatureFormSchema>>;
