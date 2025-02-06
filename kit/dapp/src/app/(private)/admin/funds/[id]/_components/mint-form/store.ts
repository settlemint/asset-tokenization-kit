'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { MintFundFormSchema, MintFundOutputSchema } from './schema';

const MintFund = portalGraphql(`
  mutation MintFund($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
    FundMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
      challengeResponse: $challengeResponse
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

export const mintFund = actionClient
  .schema(
    MintFundFormSchema.extend({
      address: z.string(),
    })
  )
  .outputSchema(MintFundOutputSchema)
  .action(async ({ parsedInput: { recipient, amount, pincode, address } }) => {
    const user = await getAuthenticatedUser();

    try {
      const data = await portalClient.request(MintFund, {
        address,
        from: user.wallet,
        to: recipient,
        amount: amount.toString(),
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      });

      const transactionHash = data.FundMint?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to mint the fund');
      }

      return transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
