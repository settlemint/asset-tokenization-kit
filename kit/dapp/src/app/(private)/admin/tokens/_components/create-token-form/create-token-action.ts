'use server';

import { auth } from '@/lib/auth/auth';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { VariablesOf } from 'gql.tada';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { CreateTokenSchema } from './create-token-form-schema';

// TODO: figure out why the portal cannot estimate the gas, i have to set it myself or it defaults to 90k
const CreateTokenMutation = portalGraphql(`
mutation CreateTokenMutation($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $gasLimit: String!, $collateralLivenessSeconds: Int!, $isin: String!) {
  StableCoinFactoryCreate(
    address: $address
    from: $from
    input: {collateralLivenessSeconds: $collateralLivenessSeconds, name: $name, symbol: $symbol, decimals: $decimals, isin: $isin}
    gasLimit: $gasLimit
    challengeResponse: $challengeResponse
  ) {
    transactionHash
  }
}
`);

const CreateWalletVerificationChallengesMutation = portalGraphql(`
mutation CreateWalletVerificationChallenges($userWalletAddress: String!) {
  createWalletVerificationChallenges(userWalletAddress: $userWalletAddress) {
    challenge
    id
    name
    verificationType
  }
}`);

function hashPincode(pincode: string, salt: string): string {
  return createHash('sha256').update(`${salt}${pincode}`).digest('hex');
}

function generateChallengeResponse(pincode: string, salt: string, challenge: string): string {
  const hashedPincode = hashPincode(pincode, salt);
  return createHash('sha256').update(`${hashedPincode}_${challenge}`).digest('hex');
}

interface Challenge {
  challenge: Record<string, unknown> | null;
  id: string | null;
  name: string | null;
  verificationType: 'OTP' | 'PINCODE' | null;
}

interface VerificationChallenges {
  createWalletVerificationChallenges: Challenge[] | null;
}

export const createTokenAction = actionClient.schema(CreateTokenSchema).action(async ({ parsedInput }) => {
  try {
    const { tokenName, tokenSymbol, pincode, decimals, isin } = parsedInput;

    if (parsedInput.tokenType !== 'stablecoin') {
      throw new Error('Only stablecoin creation is supported');
    }

    const { collateralProofValidityDuration } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const verificationChallenges = (await portalClient.request(CreateWalletVerificationChallengesMutation, {
      userWalletAddress: session.user.wallet,
    })) as VerificationChallenges;

    if (!verificationChallenges.createWalletVerificationChallenges?.length) {
      throw new Error('No verification challenges received');
    }

    const firstChallenge = verificationChallenges.createWalletVerificationChallenges[0];
    const challenge = firstChallenge?.challenge as { secret: string; salt: string } | null;
    if (!challenge?.secret || !challenge?.salt) {
      throw new Error('Could not authenticate pin code, invalid challenge format');
    }

    const { secret, salt } = challenge;
    const challengeResponse = generateChallengeResponse(pincode, salt, secret);

    const variables: VariablesOf<typeof CreateTokenMutation> = {
      address: STABLE_COIN_FACTORY_ADDRESS,
      from: session.user.wallet,
      name: tokenName,
      symbol: tokenSymbol,
      decimals,
      isin: isin || '',
      challengeResponse,
      gasLimit: '5000000',
      collateralLivenessSeconds: collateralProofValidityDuration,
    };

    const result = await portalClient.request(CreateTokenMutation, variables);

    const transactionHash = result?.StableCoinFactoryCreate?.transactionHash;

    if (!transactionHash) {
      throw new Error('Transaction hash not found');
    }

    return transactionHash;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '';
    throw new Error(`Error creating token ${errorMessage ? `: ${errorMessage}` : ''}`);
  }
});
