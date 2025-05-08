import { t, type StaticDecode } from "@/lib/utils/typebox";

export const ApproveXvpSchema = t.Object(
  {
    approved: t.Boolean({
      description: "To approve or not to approve",
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
    $id: "ApproveXvpForm",
    additionalProperties: false,
  }
);

export type ApproveXvpInput = StaticDecode<typeof ApproveXvpSchema>;
