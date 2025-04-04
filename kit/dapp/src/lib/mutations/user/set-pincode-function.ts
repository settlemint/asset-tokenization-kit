import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { revalidateTag } from "next/cache";
import { ApiError } from "next/dist/server/api-utils";
import { headers } from "next/headers";
import { auth } from "../../auth/auth";
import type { SetPincodeInput } from "./set-pincode-schema";

/**
 * GraphQL mutation to set a pincode for wallet verification
 */
const SetPinCode = portalGraphql(`
  mutation SetPinCode($address: String!, $pincode: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {pincode: {name: "PINCODE", pincode: $pincode}}
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

/**
 * Function to set a pincode for wallet verification
 *
 * @param parsedInput - Validated input containing pincode
 * @param ctx - Optional context containing user information
 * @returns Object indicating success status
 */
export async function setPincodeFunction({
  parsedInput: { pincode },
  ctx,
}: {
  parsedInput: SetPincodeInput;
  ctx?: { user: User };
}) {
  const currentUser = ctx?.user ?? (await getUser());
  const { createWalletVerification } = await portalClient.request(SetPinCode, {
    address: currentUser.wallet,
    pincode: pincode.toString(),
  });
  if (!createWalletVerification?.id) {
    throw new ApiError(500, "Failed to create wallet verification");
  }
  const updatedUser: Partial<User> = {
    pincodeEnabled: true,
    pincodeVerificationId: createWalletVerification.id,
  };
  const headersList = await headers();
  await auth.api.updateUser({
    headers: headersList,
    body: updatedUser,
  });
  revalidateTag("user");
  return { success: true };
}
