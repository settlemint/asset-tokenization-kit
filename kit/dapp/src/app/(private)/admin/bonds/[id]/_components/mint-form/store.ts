'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { z } from 'zod';
import { MintBondFormSchema, MintBondOutputSchema } from './schema';

const MintBond = portalGraphql(`
  mutation MintBond($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!, $gasLimit: String!) {
    BondMint(
      address: $address
      from: $from
      input: {amount: $amount, to: $to}
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

export const mintBond = actionClient
  .schema(
    MintBondFormSchema.extend({
      address: z.string(),
      decimals: z.number(),
    })
  )
  .outputSchema(MintBondOutputSchema)
  .action(async ({ parsedInput: { recipient, amount, pincode, address, decimals } }) => {
    const user = await getAuthenticatedUser();

    try {
      const data = await portalClient.request(MintBond, {
        address,
        from: user.wallet,
        to: recipient,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet as Address, pincode),
        // Manually raise gas limit
        gasLimit: '200000',
      });

      const transactionHash = data.BondMint?.transactionHash;
      if (!transactionHash) {
        throw new Error('Failed to send the transaction to mint the bond');
      }

      return transactionHash;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid challenge response')) {
        throw new InvalidChallengeResponseError();
      }
      throw error;
    }
  });
