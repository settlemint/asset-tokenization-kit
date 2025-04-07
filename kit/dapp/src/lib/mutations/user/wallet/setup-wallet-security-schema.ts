import type { NonEmptyArray } from "@/lib/utils/non-empty-array";
import { type StaticDecode, t } from "@/lib/utils/typebox";

export const WalletSecurityMethodOptions = {
  Pincode: "pincode",
  TwoFactorAuthentication: "two-factor-authentication",
} as const;

export function SetupWalletSecuritySchema() {
  return t.Object({
    method: t.UnionEnum(
      Object.values(WalletSecurityMethodOptions) as NonEmptyArray<
        (typeof WalletSecurityMethodOptions)[keyof typeof WalletSecurityMethodOptions]
      >,
      {
        description: "The method to use for the wallet security",
      }
    ),
    firstOtp: t.Optional(t.String()),
    pincode: t.Optional(t.String()),
  });
}

export type SetupWalletSecurityInput = StaticDecode<
  ReturnType<typeof SetupWalletSecuritySchema>
>;
