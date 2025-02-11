'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { BurnFundFormSchema, BurnFundOutputSchema } from './schema';

interface BurnFundResponse {
  FundBurn: {
    transactionHash: string;
  };
}

const BurnFund = portalGraphql(`
  mutation BurnFund($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    FundBurn(
      address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const burnFund = actionClient
  .schema(BurnFundFormSchema)
  .outputSchema(BurnFundOutputSchema)
  .action(async ({ parsedInput: { address, amount, pincode } }) => {
    const user = await getAuthenticatedUser();

    const data = await portalClient.request<BurnFundResponse>(BurnFund, {
      address: address,
      from: user.wallet as string,
      amount: amount.toString(),
      challengeResponse: pincode,
    });

    const transactionHash = data.FundBurn?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to burn the fund');
    }

    return transactionHash;
  });
