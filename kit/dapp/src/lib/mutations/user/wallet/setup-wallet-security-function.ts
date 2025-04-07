import { authClient } from "@/lib/auth/client";
import { setPincodeFunction } from "../set-pincode-function";
import {
  WalletSecurityMethodOptions,
  type SetupWalletSecurityInput,
} from "./setup-wallet-security-schema";

export async function setupWalletSecurityFunction({
  parsedInput: { method, firstOtp, pincode },
}: {
  parsedInput: SetupWalletSecurityInput;
}) {
  if (
    method === WalletSecurityMethodOptions.TwoFactorAuthentication &&
    firstOtp
  ) {
    await authClient.twoFactor.verifyTotp({
      code: firstOtp,
    });
  }
  if (method === WalletSecurityMethodOptions.Pincode && pincode) {
    await setPincodeFunction({
      parsedInput: {
        pincode,
      },
    });
  }
  return {
    success: true,
  };
}
