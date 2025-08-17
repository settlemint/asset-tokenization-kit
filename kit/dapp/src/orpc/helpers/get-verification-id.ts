/**
 * Verification ID Resolution Helper
 *
 * @remarks
 * This helper resolves the appropriate verification ID from a user's session data
 * based on their selected verification type. Each user can have multiple verification
 * methods configured simultaneously, and this function provides the mapping logic.
 *
 * VERIFICATION TYPE MAPPING:
 * - OTP: Time-based one-time passwords (Google Authenticator, Authy, etc.)
 * - PINCODE: Numerical PIN with cryptographic challenge-response
 * - SECRET_CODES: Backup recovery codes (typically 12-word phrases)
 *
 * SECURITY CONSIDERATIONS:
 * - Verification IDs are stored in user session after authentication
 * - Each type has separate ID to prevent cross-verification attacks
 * - Returns undefined if user hasn't configured the requested verification type
 */

import type { SessionUser } from "@/lib/auth";

/**
 * Resolves the appropriate verification ID from user session data.
 *
 * @param user - Authenticated user session containing verification IDs
 * @param verificationType - The type of verification being performed
 * @returns The verification ID for the specified type, or undefined if not configured
 *
 * @example
 * ```typescript
 * // Get OTP verification ID for Google Authenticator
 * const otpId = getVerificationId(user, "OTP");
 *
 * // Get PINCODE verification ID for challenge-response
 * const pincodeId = getVerificationId(user, "PINCODE");
 *
 * // Handle missing verification setup
 * const secretId = getVerificationId(user, "SECRET_CODES");
 * if (!secretId) {
 *   throw new Error("User has not configured backup codes");
 * }
 * ```
 */
export function getVerificationId(
  user: SessionUser,
  verificationType: "OTP" | "PINCODE" | "SECRET_CODES"
): string | undefined {
  if (verificationType === "PINCODE") {
    // PINCODE: Numerical PIN requiring challenge-response protocol
    return user.pincodeVerificationId ?? undefined;
  }
  if (verificationType === "SECRET_CODES") {
    // SECRET_CODES: Backup recovery codes for account recovery
    return user.secretCodeVerificationId ?? undefined;
  }
  // OTP: Default to two-factor authentication via time-based codes
  return user.twoFactorVerificationId ?? undefined;
}
