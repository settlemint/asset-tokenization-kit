'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { PauseEquityFormSchema, PauseEquityOutputSchema } from './schema';

const PauseEquity = portalGraphql(`
  mutation PauseEquity($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!) {
    EquityPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const UnpauseEquity = portalGraphql(`
  mutation UnpauseEquity($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!) {
    EquityUnpause(
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

export const pauseEquity = actionClient
  .schema(
    PauseEquityFormSchema.extend({
      address: z.string(),
      paused: z.boolean(),
    })
  )
  .outputSchema(PauseEquityOutputSchema)
  .action(async ({ parsedInput: { pincode, address, paused } }) => {
    const user = await getAuthenticatedUser();

    try {
      if (paused) {
        const { EquityUnpause } = await portalClient.request(UnpauseEquity, {
          address,
          from: user.wallet,
          challengeResponse: await handleChallenge(user.wallet as Address, pincode),
          gasLimit: '200000',
        });
        if (!EquityUnpause?.transactionHash) {
          throw new Error('Failed to send the transaction to unpause the equity');
        }
        return EquityUnpause.transactionHash;
      }

      const { EquityPause } = await portalClient.request(PauseEquity, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '200000',
      });
      if (!EquityPause?.transactionHash) {
        throw new Error('Failed to send the transaction to pause the equity');
      }
      return EquityPause.transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
