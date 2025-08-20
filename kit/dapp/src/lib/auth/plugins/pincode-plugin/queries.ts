import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
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

interface UserWithPincodeContext {
  wallet?: EthereumAddress | null;
  pincodeEnabled?: boolean | null;
  pincodeVerificationId?: string | null;
}

/**
 * Sets a pincode for a user
 * @param user - The user to set the pincode for
 * @param pincode - The pincode to set
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
 * Removes a pincode for a user
 * @param user - The user to remove the pincode for
 * @param verificationId - The verification ID of the pincode to remove
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
 * Updates a pincode for a user
 * @param user - The user to update the pincode for
 * @param newPincode - The new pincode to set
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
