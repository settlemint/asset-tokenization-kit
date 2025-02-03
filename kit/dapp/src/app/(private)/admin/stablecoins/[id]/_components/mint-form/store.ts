'use server';

import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { CreateStablecoinOutputSchema } from './schema';
import { CreateStablecoinFormSchema } from './schema';

const MintStableCoin = portalGraphql(`
  mutation MintStableCoin($address: String!, $from: String!, $input: StableCoinMintInput!) {
    StableCoinMint(address: $address, from: $from, input: $input) {
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

    const data = await portalClient.request(MintStableCoin, {
      address: STABLE_COIN_FACTORY_ADDRESS,
      from: user.wallet as string,
      input: {
        to: address,
        amount: amount.toString(),
        pincode,
        metadata: {
          organization: organizationId,
        },
      },
    });

    const transactionHash = data.StableCoinMint?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to mint the stablecoin');
    }

    return transactionHash;
  });
