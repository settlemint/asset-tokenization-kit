import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import type { User } from "./auth/types";
import type { VerificationType } from "./utils/typebox/verification-type";

/**
 * Represents the structure of a wallet verification challenge
 */
interface WalletVerificationChallenge {
  challenge: {
    secret: string;
    salt: string;
  };
  id: string;
  name: string;
  verificationType: string;
}

/**
 * Response type for the CreateWalletVerificationChallenges mutation
 */
interface CreateWalletVerificationChallengesResponse {
  createWalletVerificationChallenges: WalletVerificationChallenge[];
}

/**
 * Custom error class for challenge-related errors
 */
class ChallengeError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ChallengeError";
    this.code = code;
  }
}

const CreateWalletVerificationChallengesMutation = portalGraphql(`
  mutation CreateWalletVerificationChallenges($userWalletAddress: String!, $verificationId: String!) {
    createWalletVerificationChallenges(userWalletAddress: $userWalletAddress, verificationId: $verificationId) {
      challenge
      id
      name
      verificationType
    }
  }
`);

/**
 * Hashes a pincode with a salt using SHA-256
 * @param pincode - The pincode to hash
 * @param salt - The salt to use in hashing
 * @returns The hashed pincode as a hex string
 */
async function hashPincode(pincode: number, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}${pincode}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates a challenge response by combining a hashed pincode with a challenge
 * @param pincode - The user's pincode
 * @param salt - The salt provided in the challenge
 * @param challenge - The challenge secret
 * @returns The challenge response as a hex string
 */
async function generateChallengeResponse(
  pincode: number,
  salt: string,
  challenge: string
): Promise<string> {
  const hashedPincode = await hashPincode(pincode, salt);
  const encoder = new TextEncoder();
  const data = encoder.encode(`${hashedPincode}_${challenge}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Handles a wallet verification challenge by generating an appropriate response
 *
 * @param user - The user to verify
 * @param userWalletAddress - The wallet address to verify
 * @param code - The code inputted by the user (can be a pincode, two factor code or secret code)
 * @param verificationType - The type of verification
 * @returns Promise resolving to the challenge response
 * @throws {ChallengeError} If the challenge cannot be created or is invalid
 */
export async function handleChallenge(
  user: User,
  userWalletAddress: Address,
  code: string | number,
  verificationType: VerificationType
): Promise<{
  challengeResponse: string;
  verificationId?: string;
}> {
  try {
    if (verificationType === "two-factor") {
      return {
        challengeResponse: code.toString(),
        verificationId: user.twoFactorVerificationId ?? undefined,
      };
    }

    if (verificationType === "secret-code") {
      // Add - separator to the code
      const formattedCode = code.toString().replace(/(.{5})(?=.)/, "$1-");
      return {
        challengeResponse: formattedCode,
        verificationId: user.secretCodeVerificationId ?? undefined,
      };
    }

    const verificationChallenges =
      await portalClient.request<CreateWalletVerificationChallengesResponse>(
        CreateWalletVerificationChallengesMutation,
        {
          userWalletAddress,
          verificationId: user.pincodeVerificationId,
        }
      );

    if (!verificationChallenges.createWalletVerificationChallenges?.length) {
      throw new ChallengeError(
        "No verification challenges received",
        "NO_CHALLENGES"
      );
    }

    const walletVerificationChallenge =
      verificationChallenges.createWalletVerificationChallenges.find(
        (challenge) => challenge.id === user.pincodeVerificationId
      );

    if (
      !walletVerificationChallenge?.challenge?.secret ||
      !walletVerificationChallenge?.challenge?.salt
    ) {
      throw new ChallengeError("Invalid challenge format", "INVALID_CHALLENGE");
    }

    const { secret, salt } = walletVerificationChallenge.challenge;
    const challengeResponse = await generateChallengeResponse(
      Number(code),
      salt,
      secret
    );
    return {
      challengeResponse,
      verificationId: user.pincodeVerificationId ?? undefined,
    };
  } catch (error) {
    if (error instanceof ChallengeError) {
      throw error;
    }
    throw new ChallengeError(
      "Failed to process wallet verification challenge",
      "CHALLENGE_PROCESSING_ERROR"
    );
  }
}
