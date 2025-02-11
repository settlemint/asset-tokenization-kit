'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { PauseFundFormSchema, PauseFundOutputSchema } from './schema';

const PauseFund = portalGraphql(`
  mutation PauseFund($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!) {
    FundPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const UnpauseFund = portalGraphql(`
  mutation UnpauseFund($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!) {
    FundUnpause(
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

export const pauseFund = actionClient
  .schema(
    PauseFundFormSchema.extend({
      address: z.string(),
      isPaused: z.boolean(),
    })
  )
  .outputSchema(PauseFundOutputSchema)
  .action(async ({ parsedInput: { pincode, address, isPaused } }) => {
    const user = await getAuthenticatedUser();

    try {
      const mutation = isPaused ? UnpauseFund : PauseFund;
      const data = await portalClient.request(mutation, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        // Manually raise gas limit
        gasLimit: '200000',
      });

      const transactionHash = data[isPaused ? 'FundUnpause' : 'FundPause']?.transactionHash;
      if (!transactionHash) {
        throw new Error(`Failed to send the transaction to ${isPaused ? 'unpause' : 'pause'} the fund`);
      }

      return transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
