'use server';

import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { CreateStablecoinOutputSchema } from './schema';
import { CreateStablecoinFormSchema } from './schema';

const CreateStablecoin = portalGraphql(`
  mutation MintStableCoin($address: String!, $from: String!, $amount: String!, $pincode: String!) {
    StableCoinFactoryMint(
      address: $address
      from: $from
      amount: $amount
      pincode: $pincode
    ) {
      transactionHash
    }
  }
`);

export const createStablecoin = actionClient
  .schema(CreateStablecoinFormSchema)
  .outputSchema(CreateStablecoinOutputSchema)
  .action(async ({ parsedInput: { address, amount, pincode } }) => {
    const user = await getAuthenticatedUser();
    const organizationId = await getActiveOrganizationId();

    const data = await portalClient.request(CreateStablecoin, {
      address: STABLE_COIN_FACTORY_ADDRESS,
      to: address,
      amount,
      pincode,
    });

    const transactionHash = data.StableCoinFactoryCreate?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to create the cryptocurrency');
    }

    return transactionHash;
  });
