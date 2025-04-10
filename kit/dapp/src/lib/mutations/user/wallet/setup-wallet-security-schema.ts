import type { NonEmptyArray } from "@/lib/utils/non-empty-array";
import { type StaticDecode, t } from "@/lib/utils/typebox";

export const WalletSecurityMethodOptions = {
  Pincode: "pincode",
  TwoFactorAuthentication: "two-factor-authentication",
} as const;

export function SetupWalletSecuritySchema() {
  return t.Object({
    verificationType: t.UnionEnum(
      Object.values(WalletSecurityMethodOptions) as NonEmptyArray<
        (typeof WalletSecurityMethodOptions)[keyof typeof WalletSecurityMethodOptions]
      >,
      {
        description: "The verification method to use for the wallet security",
      }
    ),
    verificationCode: t.Union([t.TwoFactorCode(), t.Pincode()], {
      description:
        "The verification code to use for the wallet security (for OTP this is the first OTP)",
    }),
    secretCodes: t.Array(t.String(), {
      description: "The secret codes to use for the wallet security",
    }),
  });
}

export type SetupWalletSecurityInput = StaticDecode<
  ReturnType<typeof SetupWalletSecuritySchema>
>;
