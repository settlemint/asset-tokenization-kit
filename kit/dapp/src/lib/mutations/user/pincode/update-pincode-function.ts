import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { removePincodeFunction } from "./remove-pincode-function";
import { setPincodeFunction } from "./set-pincode-function";

/**
 * Function to update a pincode for wallet verification
 *
 * @param parsedInput - Validated input containing pincode
 * @param ctx - Optional context containing user information
 * @returns Object indicating success status
 */
export async function updatePincodeFunction({
  parsedInput: { pincode },
  ctx,
}: {
  parsedInput: { pincode: string };
  ctx?: { user: User };
}): Promise<{ success: boolean; verificationId: string }> {
  const currentUser = ctx?.user ?? (await getUser());
  if (currentUser.pincodeEnabled && currentUser.pincodeVerificationId) {
    await removePincodeFunction({ ctx });
  }
  return setPincodeFunction({
    parsedInput: { pincode },
    ctx: {
      user: {
        ...currentUser,
        pincodeEnabled: false,
      },
    },
  });
}
