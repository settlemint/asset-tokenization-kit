'use server';

import { createHash } from 'node:crypto';
import { auth } from '@/lib/auth/auth';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { VariablesOf } from 'gql.tada';
import { headers } from 'next/headers';
import { CreateTokenSchema } from './create-token-form-schema';

// TODO: figure out why the portal cannot estimate the gas, i have to set it myself or it defaults to 90k
const CreateTokenMutation = portalGraphql(`
mutation CreateTokenMutation($address: String!, $from: String!, $name: String!, $symbol: String!, $decimals: Int!, $challengeResponse: String!, $gasLimit: String!, $collateralLivenessSeconds: Int!) {
  StableCoinFactoryCreate(
    address: $address
    from: $from
    input: {collateralLivenessSeconds: $collateralLivenessSeconds, name: $name, symbol: $symbol, decimals: $decimals}
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

export const createTokenAction = actionClient.schema(CreateTokenSchema).action(async ({ parsedInput }) => {
  try {
    const { tokenName, tokenSymbol, pincode, decimals, collateralProofValidityDuration } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const verificationChallenges = await portalClient.request(CreateWalletVerificationChallengesMutation, {
      userWalletAddress: session.user.wallet,
    });

    // Get the first challenge
    const firstChallenge = verificationChallenges?.createWalletVerificationChallenges?.[0]?.challenge as {
      secret: string;
      salt: string;
    };
    if (!firstChallenge) {
      throw new Error('Could not authenticate pin code, no verification challenge received');
    }

    const challengeResponse = generateChallengeResponse(pincode, firstChallenge.salt, firstChallenge.secret);

    const variables: VariablesOf<typeof CreateTokenMutation> = {
      address: STABLE_COIN_FACTORY_ADDRESS,
      from: session.user.wallet,
      name: tokenName,
      symbol: tokenSymbol,
      decimals,
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
