import { ApiError } from "next/dist/server/api-utils";
import { headers } from "next/headers";
import { auth } from "../../../auth/auth";
import { setPincodeFunction } from "../pincode/set-pincode-function";
import {
  WalletSecurityMethodOptions,
  type SetupWalletSecurityInput,
} from "./setup-wallet-security-schema";

export async function setupWalletSecurityFunction({
  parsedInput: { verificationType, verificationCode },
}: {
  parsedInput: SetupWalletSecurityInput;
}) {
  if (
    verificationType === WalletSecurityMethodOptions.TwoFactorAuthentication
  ) {
    if (!verificationCode) {
      throw new ApiError(400, "First OTP is required");
    }
    await auth.api.verifyTOTP({
      headers: await headers(),
      body: {
        code: verificationCode,
      },
    });
  } else if (verificationType === WalletSecurityMethodOptions.Pincode) {
    if (!verificationCode) {
      throw new ApiError(400, "Pincode is required");
    }
    await setPincodeFunction({
      parsedInput: {
        pincode: verificationCode,
      },
    });
  } else {
    throw new ApiError(400, `Invalid verification type: '${verificationType}'`);
  }
  return {
    success: true,
  };
}
