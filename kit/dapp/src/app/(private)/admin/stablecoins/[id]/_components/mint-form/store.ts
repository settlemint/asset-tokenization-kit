'use server';

import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { handleChallenge } from '@/lib/challenge';
import { STABLE_COIN_FACTORY_ADDRESS } from '@/lib/contracts';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { Address } from 'viem';
import { CreateStablecoinOutputSchema } from './schema';
import { CreateStablecoinFormSchema } from './schema';

const MintStableCoin = portalGraphql(`
  mutation MintStableCoin($address: String!, $to: String!, $amount: String!, $pincode: String!) {
    StableCoinMint(address: $address, to: $to, amount: $amount, pincode: $pincode) {
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
      to: address,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      amount,
      metadata: {
        organization: organizationId,
        predictedAddress: predictedAddress.MintFactory?.predictAddress?.predicted,
      },
    });

    const transactionHash = data.StableCoinMint?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to create the cryptocurrency');
    }

    return transactionHash;
  });
