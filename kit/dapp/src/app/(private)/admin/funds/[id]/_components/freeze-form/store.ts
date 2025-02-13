'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { FreezeFundFormSchema, FreezeFundOutputSchema } from './schema';

const FreezeFund = portalGraphql(`
  mutation FreezeFund($address: String!, $from: String!, $challengeResponse: String!, $gasLimit: String!, $input: FundFreezeInput!) {
    FundFreeze(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      gasLimit: $gasLimit
      input: $input
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

export const freezeFund = actionClient
  .schema(
    FreezeFundFormSchema.extend({
      address: z.string(),
    })
  )
  .outputSchema(FreezeFundOutputSchema)
  .action(async ({ parsedInput: { pincode, address, account } }) => {
    const user = await getAuthenticatedUser();

    try {
      const { FundFreeze } = await portalClient.request(FreezeFund, {
        address,
        from: user.wallet,
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        gasLimit: '200000',
        input: {
          account,
        },
      });

      if (!FundFreeze?.transactionHash) {
        throw new Error('Failed to send the transaction to freeze the account');
      }
      return FundFreeze.transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
