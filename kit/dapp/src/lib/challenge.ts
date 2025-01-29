import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { createHash } from 'node:crypto';
import type { Address } from 'viem';

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

function hashPincode(pincode: string, salt: string): string {
  return createHash('sha256').update(`${salt}${pincode}`).digest('hex');
}

function generateChallengeResponse(pincode: string, salt: string, challenge: string): string {
  const hashedPincode = hashPincode(pincode, salt);
  return createHash('sha256').update(`${hashedPincode}_${challenge}`).digest('hex');
}

export async function handleChallenge(userWalletAddress: Address, pincode: string) {
  const verificationChallenges = await portalClient.request(CreateWalletVerificationChallengesMutation, {
    userWalletAddress,
  });

  if (!verificationChallenges.createWalletVerificationChallenges?.length) {
    throw new Error('No verification challenges received');
  }

  const firstChallenge = verificationChallenges.createWalletVerificationChallenges[0];
  const challenge = firstChallenge?.challenge as { secret: string; salt: string } | null;
  if (!challenge?.secret || !challenge?.salt) {
    throw new Error('Could not authenticate pin code, invalid challenge format');
  }

  const { secret, salt } = challenge;
  return generateChallengeResponse(pincode, salt, secret);
}
