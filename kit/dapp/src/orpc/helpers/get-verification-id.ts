import type { SessionUser } from "@/lib/auth";

/**
 * Gets the appropriate verification ID from the user based on verification type
 */
export function getVerificationId(
  user: SessionUser,
  verificationType: "OTP" | "PINCODE" | "SECRET_CODES"
): string | undefined {
  if (verificationType === "PINCODE") {
    return user.pincodeVerificationId ?? undefined;
  }
  if (verificationType === "SECRET_CODES") {
    return user.secretCodeVerificationId ?? undefined;
  }
  return user.twoFactorVerificationId ?? undefined;
}
