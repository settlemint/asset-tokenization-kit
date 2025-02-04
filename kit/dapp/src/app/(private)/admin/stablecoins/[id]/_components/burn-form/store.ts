'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { BurnStablecoinFormSchema, BurnStablecoinOutputSchema } from './schema';

// TODO: this does not work
const BurnStableCoin = portalGraphql(`
  mutation BurnStableCoin($address: String!, $from: String!, $input: StableCoinBurnInput!) {
    StableCoinBurn(address: $address, from: $from, input: $input) {
      transactionHash
    }
  }
`);

export const burnStablecoin = actionClient
  .schema(BurnStablecoinFormSchema)
  .outputSchema(BurnStablecoinOutputSchema)
  .action(async ({ parsedInput: { address, amount, pincode } }) => {
    const user = await getAuthenticatedUser();

    const data = await portalClient.request(BurnStableCoin, {
      address: STABLE_COIN_FACTORY_ADDRESS,
      from: user.wallet as string,
      input: {
        value: address,
        amount: amount.toString(),
        pincode,
      },
    });

    const transactionHash = data.StableCoinBurn?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to burn the stablecoin');
    }

    return transactionHash;
  });
