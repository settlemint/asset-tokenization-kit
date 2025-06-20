import { type StaticDecode, t } from "@/lib/utils/typebox";

export function VerifyTwoFactorOTPSchema() {
  return t.Object(
    {
      code: t.TwoFactorCode({
        description: "The OTP code",
      }),
    },
    {
      description: "Schema for verifying 2FA OTP",
    }
  );
}

export type VerifyTwoFactorOTPInput = StaticDecode<
  ReturnType<typeof VerifyTwoFactorOTPSchema>
>;
