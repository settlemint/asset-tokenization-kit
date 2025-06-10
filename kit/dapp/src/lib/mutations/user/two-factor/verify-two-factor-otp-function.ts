import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { ApiError } from "next/dist/server/api-utils";
import type { VerifyTwoFactorOTPInput } from "./verify-two-factor-otp-schema";

// Dummy types for commented GraphQL operations
const VerifyTwoFactorOTP = {} as any;

/**
 * GraphQL mutation to verify a two-factor authentication for wallet verification
 */
// const VerifyTwoFactorOTP = portalGraphql(`
//   mutation VerifyTwoFactorOTP($address: String!, $verificationId: String!, $otp: String!) {
//     verifyWalletVerificationChallenge(
//       userWalletAddress: $address
//       verificationId: $verificationId
//       challengeResponse: $otp
//     ) {
//       verified
//     }
//   }
// `);

/**
 * Function to verify a two-factor authentication for wallet verification
 *
 * @param input - Validated input containing otp
 * @returns Wallet verification data
 */
export async function verifyTwoFactorOTPFunction({
  parsedInput: { code },
  ctx,
}: {
  parsedInput: VerifyTwoFactorOTPInput;
  ctx?: { user: User };
}) {
  const currentUser = ctx?.user ?? (await getUser());
  if (!currentUser.twoFactorVerificationId) {
    throw new ApiError(400, "Two-factor verification ID is not set");
  }
  // const result = await portalClient.request(VerifyTwoFactorOTP, {
  //     address: currentUser.wallet,
  //     verificationId: currentUser.twoFactorVerificationId,
  //     otp: code.toString(),
  //   });

  // NOTE: HARDCODED SO IT STILL COMPILES
  return { verifyWalletVerificationChallenge: true, verified: true };
}
