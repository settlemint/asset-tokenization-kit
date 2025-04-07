import { authClient } from "@/lib/auth/client";
import { ApiError } from "next/dist/server/api-utils";
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
  if (method === WalletSecurityMethodOptions.TwoFactorAuthentication) {
    if (!firstOtp) {
      throw new ApiError(400, "First OTP is required");
    }
    await authClient.twoFactor.verifyTotp({
      code: firstOtp,
    });
  } else if (method === WalletSecurityMethodOptions.Pincode) {
    if (!pincode) {
      throw new ApiError(400, "Pincode is required");
    }
    await setPincodeFunction({
      parsedInput: {
        pincode,
      },
    });
  } else {
    throw new ApiError(400, `Invalid method: '${method}'`);
  }
  return {
    success: true,
  };
}
