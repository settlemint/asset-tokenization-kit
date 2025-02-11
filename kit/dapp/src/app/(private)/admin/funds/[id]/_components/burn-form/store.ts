'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { z } from 'zod';
import { BurnFundFormSchema, BurnFundOutputSchema } from './schema';

const BurnFund = portalGraphql(`
  mutation BurnFund($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $gasLimit: String!) {
    FundBurn(
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

export const burnFund = actionClient
  .schema(
    BurnFundFormSchema.extend({
      address: z.string(),
      decimals: z.number(),
    })
  )
  .outputSchema(BurnFundOutputSchema)
  .action(async ({ parsedInput: { amount, pincode, address, decimals } }) => {
    const user = await getAuthenticatedUser();

    try {
      const data = await portalClient.request(BurnFund, {
        address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        // Manually raise gas limit
        gasLimit: '200000',
      });

      const transactionHash = data.FundBurn?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to burn the fund');
      }

      return transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
