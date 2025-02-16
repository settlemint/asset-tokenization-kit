'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { BurnFormSchema, BurnOutputSchema } from './schema';

const BurnBonds = portalGraphql(`
  mutation BurnBonds($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    BondBurn(
    address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const burnBonds = actionClient
  .schema(BurnFormSchema)
  .outputSchema(BurnOutputSchema)
  .action(async ({ parsedInput: { address, amount, pincode, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(BurnBonds, {
      address: address,
      from: user.wallet,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.BondBurn?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to burn the bonds');
    }

    return transactionHash;
  });
