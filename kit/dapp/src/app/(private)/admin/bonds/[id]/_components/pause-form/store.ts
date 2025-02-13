'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { PauseBondFormSchema, PauseBondOutputSchema } from './schema';

const PauseBond = portalGraphql(`
  mutation PauseBond($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!) {
    BondPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
    ) {
      transactionHash
    }
  }
`);

const UnpauseBond = portalGraphql(`
  mutation UnpauseBond($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!) {
    BondUnpause(
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

export const pauseBond = actionClient
  .schema(
    PauseBondFormSchema.extend({
      address: z.string(),
      paused: z.boolean(),
    })
  )
  .outputSchema(PauseBondOutputSchema)
  .action(async ({ parsedInput: { pincode, address, paused } }) => {
    const user = await getAuthenticatedUser();

    try {
      if (paused) {
        const { BondUnpause } = await portalClient.request(UnpauseBond, {
          address,
          from: user.wallet,
          challengeResponse: await handleChallenge(user.wallet as Address, pincode),
          gasLimit: '200000',
        });
        if (!BondUnpause?.transactionHash) {
          throw new Error('Failed to send the transaction to unpause the bond');
        }
        return BondUnpause.transactionHash;
      }

      const { BondPause } = await portalClient.request(PauseBond, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '200000',
      });
      if (!BondPause?.transactionHash) {
        throw new Error('Failed to send the transaction to pause the fund');
      }
      return BondPause.transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
