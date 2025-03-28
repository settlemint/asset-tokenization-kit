import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
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
  await portalClient.request(SetPinCode, {
    address: currentUser?.wallet,
    pincode: pincode.toString(),
  });
  return { success: true };
}
