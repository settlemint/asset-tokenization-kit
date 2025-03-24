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
  parsedInput: { name, address, pincode },
}: {
  parsedInput: SetPincodeInput;
}) {
  const result = await portalClient.request(SetPinCode, {
    name,
    address,
    pincode: pincode.toString(),
  });

  return result.createWalletVerification;
}
