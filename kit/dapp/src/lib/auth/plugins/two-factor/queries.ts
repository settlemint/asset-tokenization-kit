import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { metadata } from "@atk/config/metadata";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import type { VariablesOf } from "@settlemint/sdk-portal";
import { APIError } from "better-auth/api";

const DELETE_WALLET_VERIFICATION_MUTATION = portalGraphql(`
  mutation DisableTwoFactor($address: String!, $verificationId: String!) {
    deleteWalletVerification(
      userWalletAddress: $address
      verificationId: $verificationId
    ) {
      success
    }
  }
`);

const VERIFY_WALLET_VERIFICATION_CHALLENGE_MUTATION = portalGraphql(`
  mutation VerifyTwoFactorOTP($verificationId: String!, $otp: String!) {
   verifyWalletVerificationChallengeById(
    challengeId: $verificationId
    challengeResponse: $otp
   ) {
    verified
   }
  }
`);

const CREATE_WALLET_VERIFICATION_MUTATION = portalGraphql(`
  mutation EnableTwoFactor(
    $address: String!,
    $algorithm: OTPAlgorithm!,
    $digits: Int!,
    $period: Int!,
    $issuer: String!
  ) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {
        otp: {
          name: "OTP",
          algorithm: $algorithm,
          digits: $digits,
          period: $period,
          issuer: $issuer
        }
      }
    ) {
      id
      name
      parameters
      verificationType
      parameters
    }
  }
`);

interface UserWithTwoFactorContext {
  wallet?: EthereumAddress | null;
  twoFactorEnabled?: boolean | null;
  twoFactorVerificationId?: string | null;
}

/**
 * Disables two-factor authentication for a user
 * @param user - The user to disable two-factor authentication for
 */
export async function disableTwoFactor(user: UserWithTwoFactorContext) {
  if (!user.wallet) {
    throw new APIError("BAD_REQUEST", {
      message: "Wallet address is not set",
    });
  }
  if (!user.twoFactorVerificationId) {
    throw new APIError("BAD_REQUEST", {
      message: "Two-factor verification ID is not set",
    });
  }
  const result = await portalClient.request(
    DELETE_WALLET_VERIFICATION_MUTATION,
    {
      address: user.wallet,
      verificationId: user.twoFactorVerificationId,
    }
  );
  return result.deleteWalletVerification;
}

/**
 * Verifies a two-factor authentication code
 * @param user - The user to verify the code for
 * @param code - The code to verify
 */
export async function verifyTwoFactorOTP(
  user: UserWithTwoFactorContext,
  code: string
) {
  if (!user.wallet) {
    throw new APIError("BAD_REQUEST", {
      message: "Wallet address is not set",
    });
  }
  if (!user.twoFactorVerificationId) {
    throw new APIError("BAD_REQUEST", {
      message: "Two-factor verification ID is not set",
    });
  }
  const result = await portalClient.request(
    VERIFY_WALLET_VERIFICATION_CHALLENGE_MUTATION,
    {
      verificationId: user.twoFactorVerificationId,
      otp: code,
    }
  );
  return {
    verified: result.verifyWalletVerificationChallengeById?.verified ?? false,
  };
}

type OTPAlgorithm = VariablesOf<
  typeof CREATE_WALLET_VERIFICATION_MUTATION
>["algorithm"];

/**
 * Enables two-factor authentication for a user
 * @param params - The parameters for the two-factor authentication
 * @param user - The user to enable two-factor authentication for
 * @returns The verification ID and the TOTP URI
 */
export async function enableTwoFactor(
  {
    algorithm,
    digits,
    period,
  }: { algorithm: OTPAlgorithm; digits: number; period: number },
  user: UserWithTwoFactorContext
) {
  if (!user.wallet) {
    throw new APIError("BAD_REQUEST", {
      message: "Wallet address is not set",
    });
  }
  if (user.twoFactorEnabled && user.twoFactorVerificationId) {
    throw new APIError("BAD_REQUEST", {
      message: "Two-factor verification already enabled",
    });
  }
  const result = await portalClient.request(
    CREATE_WALLET_VERIFICATION_MUTATION,
    {
      address: user.wallet,
      algorithm,
      digits,
      period,
      issuer: metadata.title,
    }
  );

  const parameters = result.createWalletVerification?.parameters as {
    uri?: string;
  };
  if (!result.createWalletVerification?.id) {
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message:
        "Failed to create wallet verification, no verification ID returned",
    });
  }

  return {
    totpURI: parameters.uri ?? "",
    verificationId: result.createWalletVerification.id,
  };
}
