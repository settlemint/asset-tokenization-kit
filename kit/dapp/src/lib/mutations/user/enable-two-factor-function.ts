import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { hasuraClient, hasuraGraphql } from "@/lib/settlemint/hasura";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { revalidateTag } from "next/cache";
import { ApiError } from "next/dist/server/api-utils";
import type { EnableTwoFactorInput } from "./enable-two-factor-schema";

/**
 * GraphQL mutation to enable a two-factor authentication for wallet verification
 */
const EnableTwoFactor = portalGraphql(`
  mutation EnableTwoFactor($address: String!, $algorithm: OTPAlgorithm!, $digits: Int!, $period: Int!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: { otp: { name: "OTP", algorithm: $algorithm, digits: $digits, period: $period } }
    ) {
      id
      name
      parameters
      verificationType
      parameters
    }
  }
`);

/**
 * GraphQL mutation to update the two-factor verification ID for a user
 */
const UpdateUserTwoFactorVerificationId = hasuraGraphql(`
  mutation UpdateUserTwoFactorVerificationId($id: String!, $verificationId: String!) {
    update_user(where: { id: {_eq: $id} }, _set:{ two_factor_verification_id: $verificationId }) {
      affected_rows
    }
  }
`);

/**
 * Function to enable a two-factor authentication for wallet verification
 *
 * @param input - Validated input containing algorithm, digits, and period
 * @returns Wallet verification data
 */
export async function enableTwoFactorFunction({
  parsedInput: { algorithm, digits, period },
  ctx,
}: {
  parsedInput: EnableTwoFactorInput;
  ctx?: { user: User };
}) {
  const currentUser = ctx?.user ?? (await getUser());
  const result = await portalClient.request(EnableTwoFactor, {
    address: currentUser.wallet,
    algorithm,
    digits,
    period,
  });
  const parameters = result.createWalletVerification?.parameters as {
    uri?: string;
  };
  if (!result.createWalletVerification?.id) {
    throw new ApiError(
      500,
      "Failed to create wallet verification, no verification ID returned"
    );
  }
  await hasuraClient.request(UpdateUserTwoFactorVerificationId, {
    id: currentUser.id,
    verificationId: result.createWalletVerification?.id,
  });
  revalidateTag("user");
  return {
    totpURI: parameters?.uri ?? "",
    verificationId: result.createWalletVerification?.id,
  };
}
