'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { BurnStablecoinFormSchema, BurnStablecoinOutputSchema } from './schema';

const BurnStableCoin = portalGraphql(`
  mutation BurnStableCoin($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    StableCoinBurn(
    address: $address
      from: $from
      input: {value: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const burnStablecoin = actionClient
  .schema(BurnStablecoinFormSchema)
  .outputSchema(BurnStablecoinOutputSchema)
  .action(async ({ parsedInput: { address, amount, from, pincode, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(BurnStableCoin, {
      address: address,
      from: from ?? (user.wallet),
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.StableCoinBurn?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to burn the stablecoin');
    }

    return transactionHash;
  });
