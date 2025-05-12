import { t, type StaticDecode } from "@/lib/utils/typebox";

export const ExecuteXvpSchema = t.Object(
  {
    xvp: t.EthereumAddress({
      description: "The address of the XVP",
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
    $id: "ExecuteXvpForm",
    additionalProperties: false,
  }
);

export type ExecuteXvpInput = StaticDecode<typeof ExecuteXvpSchema>;
