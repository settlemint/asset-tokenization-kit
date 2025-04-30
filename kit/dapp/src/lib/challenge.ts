import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { handleWalletVerificationChallenge } from "@settlemint/sdk-portal";
import type { Address } from "viem";
import type { User } from "./auth/types";
import type { VerificationType } from "./utils/typebox/verification-type";

/**
 * Handles a wallet verification challenge by generating an appropriate response
 *
 * @param user - The user to verify
 * @param userWalletAddress - The wallet address to verify
 * @param code - The code inputted by the user (can be a pincode, two factor code or secret code)
 * @param verificationType - The type of verification
 * @returns Promise resolving to the challenge response
 * @throws {ChallengeError} If the challenge cannot be created or is invalid
 */
export async function handleChallenge(
  user: User,
  userWalletAddress: Address,
  code: string | number,
  verificationType: VerificationType
) {
  const verificationId = getVerificationId(user, verificationType);
  if (!verificationId) {
    throw new Error("Verification ID not found");
  }
  return handleWalletVerificationChallenge({
    verificationId,
    userWalletAddress,
    code,
    verificationType:
      verificationType === "two-factor" ? "otp" : verificationType,
    portalClient,
    portalGraphql,
  });
}

function getVerificationId(user: User, verificationType: VerificationType) {
  if (verificationType === "pincode") {
    return user.pincodeVerificationId;
  }
  if (verificationType === "secret-code") {
    return user.secretCodeVerificationId;
  }
  return user.twoFactorVerificationId;
}
