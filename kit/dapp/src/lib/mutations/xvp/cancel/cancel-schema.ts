import { t, type StaticDecode } from "@/lib/utils/typebox";

export const CancelXvpSchema = t.Object(
  {
    verificationCode: t.VerificationCode({
      description:
        "The verification code (PIN, 2FA, or secret code) for signing the transaction",
    }),
    verificationType: t.VerificationType({
      description: "The type of verification",
    }),
  },
  {
    $id: "ApproveXvpForm",
    additionalProperties: false,
  }
);

export type CancelXvpInput = StaticDecode<typeof CancelXvpSchema>;
