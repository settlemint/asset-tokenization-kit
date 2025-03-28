import { type StaticDecode, t } from "@/lib/utils/typebox";

export function TwoFactorSchema() {
  return t.Object(
    {
      code: t.Pincode({
        description: "The OTP code",
      }),
    },
    {
      description: "Schema for verifying 2FA OTP",
    }
  );
}

export type TwoFactorInput = StaticDecode<ReturnType<typeof TwoFactorSchema>>;
