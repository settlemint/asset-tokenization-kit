import { t, type StaticDecode } from "@/lib/utils/typebox";

export const ClaimXvpSchema = t.Object(
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
    $id: "ApproveXvpForm",
    additionalProperties: false,
  }
);

export type ClaimXvpInput = StaticDecode<typeof ClaimXvpSchema>;
