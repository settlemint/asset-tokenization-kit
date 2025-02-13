'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { z } from 'zod';
import { BurnEquityFormSchema, BurnEquityOutputSchema } from './schema';

const BurnEquity = portalGraphql(`
  mutation BurnEquity($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $gasLimit: String!) {
    EquityBurn(
      address: $address
      from: $from
      input: {value: $amount}
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

export const burnEquity = actionClient
  .schema(
    BurnEquityFormSchema.extend({
      address: z.string(),
      decimals: z.number(),
    })
  )
  .outputSchema(BurnEquityOutputSchema)
  .action(async ({ parsedInput: { amount, pincode, address, decimals } }) => {
    const user = await getAuthenticatedUser();

    try {
      const data = await portalClient.request(BurnEquity, {
        address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        // Manually raise gas limit
        gasLimit: '200000',
      });

      const transactionHash = data.EquityBurn?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to burn the equity');
      }

      return transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
