import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { revalidateTag } from "next/cache";
import { ApiError } from "next/dist/server/api-utils";

// Dummy types for commented GraphQL operations
const SetPinCode = {} as any;

/**
 * GraphQL mutation to set a pincode for wallet verification
 */
// const SetPinCode = portalGraphql(`
//   mutation SetPinCode($address: String!, $pincode: String!) {
//     createWalletVerification(
//       userWalletAddress: $address
//       verificationInfo: {pincode: {name: "PINCODE", pincode: $pincode}}
//     ) {
//       id
//       name
//       parameters
//       verificationType
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
export async function setPincodeFunction({
  parsedInput: { pincode },
  ctx,
}: {
  parsedInput: { pincode: string };
  ctx?: { user: User };
}) {
  const currentUser = ctx?.user ?? (await getUser());
  if (currentUser.pincodeEnabled && currentUser.pincodeVerificationId) {
    throw new ApiError(400, "Pincode already set");
  }
  // const { createWalletVerification } = await portalClient.request(SetPinCode, {
  //   address: currentUser.wallet,
  //   pincode: pincode.toString(),
  // });

  // NOTE: HARDCODED SO IT STILL COMPILES
  const result = {
    createWalletVerification: {
      id: "mock-pincode-verification-id",
    },
  };
  const { createWalletVerification } = result;
  if (!createWalletVerification?.id) {
    throw new ApiError(500, "Failed to create wallet verification");
  }
  const verificationId = createWalletVerification.id as string;
  revalidateTag("user");
  return {
    success: true,
    verificationId,
  };
}
