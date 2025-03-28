import type { User } from "@/lib/auth/types";
import { getUser } from "@/lib/auth/utils";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { EnableTwoFactorInput } from "./enable-two-factor-schema";

/**
 * GraphQL mutation to set a two-factor authentication for wallet verification
 */
const SetTwoFactor = portalGraphql(`
  mutation SetTwoFactor($address: String!, $algorithm: OTPAlgorithm!, $digits: Int!, $period: Int!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: { otp: { name: "OTP", algorithm: $algorithm, digits: $digits, period: $period } }
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

/**
 * Function to set a two-factor authentication for wallet verification
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
  await portalClient.request(SetTwoFactor, {
    address: currentUser?.wallet,
    algorithm,
    digits,
    period,
  });
  return { success: true };
}
