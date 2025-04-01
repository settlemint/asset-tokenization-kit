import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { hasuraClient } from "../../settlemint/hasura";
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
 * GraphQL mutation to update the pincode enabled status for a user
 */
const UpdateUserPincodeEnabled = hasuraGraphql(`
  mutation UpdateUserPincodeEnabled($id: String!) {
    update_user(where: { id: {_eq: $id} }, _set:{ pincode_enabled: true }) {
      affected_rows
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
    address: currentUser.wallet,
    pincode: pincode.toString(),
  });
  await hasuraClient.request(UpdateUserPincodeEnabled, {
    id: currentUser.id,
  });
  return { success: true };
}
