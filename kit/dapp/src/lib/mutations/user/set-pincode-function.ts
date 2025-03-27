import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { SetPincodeInput } from "./set-pincode-schema";

/**
 * GraphQL mutation to set a pincode for wallet verification
 */
const SetPinCode = portalGraphql(`
  mutation SetPinCode($name: String!, $address: String!, $pincode: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {pincode: {name: $name, pincode: $pincode}}
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
 * @param input - Validated input containing name, address, and pincode
 * @returns Wallet verification data
 */
export async function setPincodeFunction({
  parsedInput: { name, pincode },
  ctx,
}: {
  parsedInput: SetPincodeInput;
  ctx?: { user: User };
}) {
  const currentUser = ctx?.user ?? (await getUser());
  await portalClient.request(SetPinCode, {
    name,
    address: currentUser?.wallet,
    pincode: pincode.toString(),
  });
  return { success: true };
}
