import { type StaticDecode, t } from "@/lib/utils/typebox";

export const ApplicationSetupSchema = () =>
  t.Object({
    verificationCode: t.VerificationCode({
      description:
        "The verification code (PIN, 2FA, or secret code) for signing the transaction",
    }),
    verificationType: t.VerificationType({
      description: "The type of verification",
    }),
  });

export type ApplicationSetupInput = StaticDecode<
  ReturnType<typeof ApplicationSetupSchema>
>;
