'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { z } from 'zod';
import { BurnFundFormSchema, BurnFundOutputSchema } from './schema';

interface BurnFundResponse {
  FundBurn: {
    transactionHash: string;
  };
}

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

export const burnFund = actionClient
  .schema(BurnFundFormSchema.extend({ address: z.string() }))
  .outputSchema(BurnFundOutputSchema)
  .action(async ({ parsedInput: { address, amount, from, pincode } }) => {
    const user = await getAuthenticatedUser();

    const data = await portalClient.request<BurnFundResponse>(BurnFund, {
      address,
      from,
      amount: amount.toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      // Manually raise gas limit
      gasLimit: '200000',
    });

    const transactionHash = data.FundBurn?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to burn the fund');
    }

    return transactionHash;
  });
