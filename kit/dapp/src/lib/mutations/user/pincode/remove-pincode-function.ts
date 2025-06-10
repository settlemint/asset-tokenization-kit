import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { revalidateTag } from "next/cache";
import { ApiError } from "next/dist/server/api-utils";

// Dummy types for commented GraphQL operations
const RemovePinCode = {} as any;


/**
 * GraphQL mutation to remove a pincode for wallet verification
 */
// const RemovePinCode = portalGraphql(`
//   mutation RemovePinCode($address: String!, $verificationId: String!) {
//     deleteWalletVerification(
//       userWalletAddress: $address
//       verificationId: $verificationId
//     ) {
//       success
//     }
//   }
// `);

/**
 * Function to set a pincode for wallet verification
 *
 * @param parsedInput - Validated input containing pincode
 * @param ctx - Optional context containing user information
 * @returns Object indicating success status
 */
export async function removePincodeFunction({ ctx }: { ctx?: { user: User } }) {
  const currentUser = ctx?.user ?? (await getUser());
  if (!currentUser.pincodeEnabled) {
    throw new ApiError(400, "Pincode already removed");
  }
  if (!currentUser.pincodeVerificationId) {
    return { success: true };
  }
  await portalClient.request(RemovePinCode, {
    address: currentUser.wallet,
    verificationId: currentUser.pincodeVerificationId,
  });
  revalidateTag("user");
  return { success: true };
}
