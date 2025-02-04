'use server';

import { getActiveOrganizationId, getAuthenticatedUser } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
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
  .action(async ({ parsedInput: { address, amount, from, pincode } }) => {
    const user = await getAuthenticatedUser();
    const organizationId = await getActiveOrganizationId();

    const data = await portalClient.request(BurnStableCoin, {
      address: address,
      from: from ?? (user.wallet as string),
      amount: amount.toString(),
      challengeResponse: pincode,
      metadata: {
        organization: organizationId,
      },
    });

    const transactionHash = data.StableCoinBurn?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to burn the stablecoin');
    }

    return transactionHash;
  });
