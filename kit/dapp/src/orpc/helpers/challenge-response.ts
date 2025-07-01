import type { SessionUser } from "@/lib/auth";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { VerificationCode } from "@/lib/zod/validators/verification-code";
import type { VerificationType } from "@/lib/zod/validators/verification-type";
import { ORPCError } from "@orpc/server";
import { handleWalletVerificationChallenge } from "@settlemint/sdk-portal";

/**
 * Maps frontend verification types to portal verification types
 */
const PORTAL_VERIFICATION_TYPE_MAP = {
  pincode: "pincode",
  "secret-code": "secret-code",
  "two-factor": "otp",
} as const satisfies Record<VerificationType, string>;

/**
 * Handles a wallet verification challenge by generating an appropriate response
 *
 * This function orchestrates the verification process for different authentication methods
 * (pincode, secret code, or two-factor authentication) by retrieving the appropriate
 * verification ID and delegating to the portal's challenge handler.
 * @param user - The user object containing verification IDs
 * @param userWalletAddress - The Ethereum wallet address to verify ownership of
 * @param verification
 * @param code - The verification code entered by the user (pincode, 2FA code, or secret code)
 * @param verificationType - The type of verification being performed
 * @param verification.code
 * @param verification.type
 * @returns Promise resolving to the challenge response from the portal
 * @throws {ORPCError} VERIFICATION_ID_NOT_FOUND when the verification ID is not found for the user
 * @throws {ORPCError} CHALLENGE_FAILED when the portal challenge handler fails
 * @example
 * ```ts
 * try {
 *   const response = await handleChallenge(
 *     user,
 *     "0x1234...",
 *     "123456",
 *     "two-factor"
 *   );
 *   // Handle successful verification
 * } catch (error) {
 *   if (error instanceof ORPCError) {
 *     // Handle specific challenge errors based on error.code
 *   }
 * }
 * ```
 */
export async function handleChallenge(
  user: SessionUser,
  verification: {
    code: VerificationCode;
    type: VerificationType;
  }
) {
  const verificationId = getVerificationId(user, verification.type);

  if (!verificationId) {
    throw new ORPCError("VERIFICATION_ID_NOT_FOUND", {
      message: `Verification ID not found for ${verification.type} authentication`,
      data: { verificationType: verification.type },
    });
  }

  try {
    return await handleWalletVerificationChallenge({
      verificationId,
      userWalletAddress: user.wallet,
      code: verification.code,
      verificationType: PORTAL_VERIFICATION_TYPE_MAP[verification.type],
      portalClient,
      portalGraphql,
    });
  } catch (error) {
    throw new ORPCError("CHALLENGE_FAILED", {
      message: `Challenge verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      data: { verificationType: verification.type },
    });
  }
}

/**
 * Retrieves the appropriate verification ID from the user object based on the verification type
 * @param user - The user object containing verification IDs
 * @param verificationType - The type of verification to get the ID for
 * @returns The verification ID string if found, undefined otherwise
 * @internal
 */
function getVerificationId(
  user: SessionUser,
  verificationType: VerificationType
) {
  if (verificationType === "pincode") {
    return user.pincodeVerificationId;
  }
  if (verificationType === "secret-code") {
    return user.secretCodeVerificationId;
  }
  return user.twoFactorVerificationId;
}
