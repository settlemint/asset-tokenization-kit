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
      paused: z.boolean(),
    })
  )
  .outputSchema(PauseFundOutputSchema)
  .action(async ({ parsedInput: { pincode, address, paused } }) => {
    const user = await getAuthenticatedUser();

    try {
      if (paused) {
        const { FundUnpause } = await portalClient.request(UnpauseFund, {
          address,
          from: user.wallet,
          challengeResponse: await handleChallenge(user.wallet as Address, pincode),
          gasLimit: '200000',
        });
        if (!FundUnpause?.transactionHash) {
          throw new Error('Failed to send the transaction to unpause the fund');
        }
        return FundUnpause.transactionHash;
      }

      const { FundPause } = await portalClient.request(PauseFund, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '200000',
      });
      if (!FundPause?.transactionHash) {
        throw new Error('Failed to send the transaction to pause the fund');
      }
      return FundPause.transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
