'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
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

export const mintFund = actionClient
  .schema(
    MintFundFormSchema.extend({
      address: z.string(),
    })
  )
  .outputSchema(MintFundOutputSchema)
  .action(async ({ parsedInput: { recipient, amount, pincode, address } }) => {
    const user = await getAuthenticatedUser();

    const data = await portalClient.request(MintFund, {
      address,
      from: user.wallet as string,
      to: recipient,
      amount: amount.toString(),
      challengeResponse: pincode,
    });

    const transactionHash = data.FundMint?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to mint the fund');
    }

    return transactionHash;
  });
