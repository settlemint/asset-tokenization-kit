import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { revalidateTag } from "next/cache";
import { ApiError } from "next/dist/server/api-utils";

/**
 * GraphQL mutation to disable a two-factor authentication for wallet verification
 */
// const DisableTwoFactor = portalGraphql(`
//   mutation DisableTwoFactor($address: String!, $verificationId: String!) {
//     deleteWalletVerification(
//       userWalletAddress: $address
//       verificationId: $verificationId
//     ) {
//       success
//     }
//   }
// `);

/**
 * Function to disable a two-factor authentication for wallet verification
 *
 * @returns Wallet verification data
 */
export async function disableTwoFactorFunction({
  ctx,
}: {
  ctx?: { user: User };
} = {}) {
  const currentUser = ctx?.user ?? (await getUser());
  if (!currentUser.twoFactorVerificationId) {
    throw new ApiError(400, "Two-factor verification ID is not set");
  }
    // const result = await portalClient.request(DisableTwoFactor, {
  //     address: currentUser.wallet,
  //     verificationId: currentUser.twoFactorVerificationId,
  //   });
  revalidateTag("user");
  return result.deleteWalletVerification;
}
