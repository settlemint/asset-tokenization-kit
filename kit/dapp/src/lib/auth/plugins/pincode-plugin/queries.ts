import type { UserWithPincodeContext } from "@/lib/auth/plugins/pincode-plugin";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { APIError } from "better-auth/api";

const SET_PINCODE_MUTATION = portalGraphql(`
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

const REMOVE_PINCODE_MUTATION = portalGraphql(`
  mutation RemovePinCode($address: String!, $verificationId: String!) {
    deleteWalletVerification(
      userWalletAddress: $address
      verificationId: $verificationId
    ) {
      success
    }
  }
`);

/**
 *
 * @param user
 * @param pincode
 */
export async function setPincode(
  user: UserWithPincodeContext,
  pincode: string
) {
  if (!user.wallet) {
    throw new APIError("BAD_REQUEST", {
      message: "User wallet not found",
    });
  }
  const result = await portalClient.request(SET_PINCODE_MUTATION, {
    address: user.wallet,
    pincode,
  });
  if (!result.createWalletVerification?.id) {
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Failed to create wallet verification",
    });
  }
  return result.createWalletVerification.id;
}

/**
 *
 * @param user
 * @param verificationId
 */
export async function removePincode(
  user: UserWithPincodeContext,
  verificationId: string
) {
  if (!user.wallet) {
    throw new APIError("BAD_REQUEST", {
      message: "User wallet not found",
    });
  }
  const result = await portalClient.request(REMOVE_PINCODE_MUTATION, {
    address: user.wallet,
    verificationId,
  });
  return result.deleteWalletVerification?.success ?? false;
}

/**
 *
 * @param user
 * @param newPincode
 */
export async function updatePincode(
  user: UserWithPincodeContext,
  newPincode: string
) {
  if (user.pincodeEnabled && user.pincodeVerificationId) {
    await removePincode(user, user.pincodeVerificationId);
  }
  return setPincode(user, newPincode);
}
