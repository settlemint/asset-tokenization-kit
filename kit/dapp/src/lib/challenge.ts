import { createHash } from 'node:crypto';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';

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
    this.name = 'ChallengeError';
    this.code = code;
  }
}

const CreateWalletVerificationChallengesMutation = portalGraphql(`
  mutation CreateWalletVerificationChallenges($userWalletAddress: String!) {
    createWalletVerificationChallenges(userWalletAddress: $userWalletAddress) {
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
function hashPincode(pincode: number, salt: string): string {
  return createHash('sha256').update(`${salt}${pincode}`).digest('hex');
}

/**
 * Generates a challenge response by combining a hashed pincode with a challenge
 * @param pincode - The user's pincode
 * @param salt - The salt provided in the challenge
 * @param challenge - The challenge secret
 * @returns The challenge response as a hex string
 */
function generateChallengeResponse(pincode: number, salt: string, challenge: string): string {
  const hashedPincode = hashPincode(pincode, salt);
  return createHash('sha256').update(`${hashedPincode}_${challenge}`).digest('hex');
}

/**
 * Handles a wallet verification challenge by generating an appropriate response
 * @param userWalletAddress - The wallet address to verify
 * @param pincode - The user's pincode
 * @returns Promise resolving to the challenge response
 * @throws {ChallengeError} If the challenge cannot be created or is invalid
 */
export async function handleChallenge(userWalletAddress: Address, pincode: number): Promise<string> {
  try {
    const verificationChallenges = await portalClient.request<CreateWalletVerificationChallengesResponse>(
      CreateWalletVerificationChallengesMutation,
      {
        userWalletAddress,
      }
    );

    if (!verificationChallenges.createWalletVerificationChallenges?.length) {
      throw new ChallengeError('No verification challenges received', 'NO_CHALLENGES');
    }

    const firstChallenge = verificationChallenges.createWalletVerificationChallenges[0];
    const challenge = firstChallenge?.challenge;

    if (!challenge?.secret || !challenge?.salt) {
      throw new ChallengeError('Invalid challenge format', 'INVALID_CHALLENGE');
    }

    const { secret, salt } = challenge;
    return generateChallengeResponse(pincode, salt, secret);
  } catch (error) {
    if (error instanceof ChallengeError) {
      throw error;
    }
    throw new ChallengeError('Failed to process wallet verification challenge', 'CHALLENGE_PROCESSING_ERROR');
  }
}
