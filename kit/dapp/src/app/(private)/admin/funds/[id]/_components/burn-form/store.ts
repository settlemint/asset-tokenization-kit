'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { BurnFormSchema, BurnOutputSchema } from './schema';

const BurnFunds = portalGraphql(`
  mutation BurnFunds($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
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

export const burnFunds = actionClient
  .schema(BurnFormSchema)
  .outputSchema(BurnOutputSchema)
  .action(async ({ parsedInput: { address, amount, pincode, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(BurnFunds, {
      address: address,
      from: user.wallet,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.FundBurn?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to burn the funds');
    }

    return transactionHash;
  });
