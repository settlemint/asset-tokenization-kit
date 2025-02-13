'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { PauseStablecoinFormSchema, PauseStablecoinOutputSchema } from './schema';

const PauseStablecoin = portalGraphql(`
  mutation PauseStablecoin($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!) {
    StableCoinPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const UnpauseStablecoin = portalGraphql(`
  mutation UnpauseStablecoin($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!) {
    StableCoinUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

class InvalidChallengeResponseError extends Error {
  constructor() {
    super('Invalid or expired pincode. Please try again with a new pincode.');
    this.name = 'InvalidChallengeResponseError';
  }
}

export const pauseStablecoin = actionClient
  .schema(
    PauseStablecoinFormSchema.extend({
      address: z.string(),
      paused: z.boolean(),
    })
  )
  .outputSchema(PauseStablecoinOutputSchema)
  .action(async ({ parsedInput: { pincode, address, paused } }) => {
    const user = await getAuthenticatedUser();

    try {
      if (paused) {
        const { StableCoinUnpause } = await portalClient.request(UnpauseStablecoin, {
          address,
          from: user.wallet,
          challengeResponse: await handleChallenge(user.wallet as Address, pincode),
          gasLimit: '200000',
        });
        if (!StableCoinUnpause?.transactionHash) {
          throw new Error('Failed to send the transaction to unpause the stablecoin');
        }
        return StableCoinUnpause.transactionHash;
      }

      const { StableCoinPause } = await portalClient.request(PauseStablecoin, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '200000',
      });
      if (!StableCoinPause?.transactionHash) {
        throw new Error('Failed to send the transaction to pause the stablecoin');
      }
      return StableCoinPause.transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
