'use server';

import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { BurnStablecoinOutputSchema } from './schema';
import { BurnStablecoinFormSchema } from './schema';

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
    const organizationId = await getActiveOrganizationId();

    const data = await portalClient.request(BurnStableCoin, {
      address: STABLE_COIN_FACTORY_ADDRESS,
      from: user.wallet as string,
      input: {
        value: address,
        amount: amount.toString(),
        pincode,
        metadata: {
          organization: organizationId,
        },
      },
    });

    const transactionHash = data.StableCoinBurn?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to burn the stablecoin');
    }

    return transactionHash;
  });
