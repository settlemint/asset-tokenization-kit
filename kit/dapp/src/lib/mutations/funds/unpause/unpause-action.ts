'use server';

import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { UnpauseSchema } from './unpause-schema';

/**
 * GraphQL mutation to unpause a fund
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FundUnpause = portalGraphql(`
  mutation FundUnpause($address: String!, $from: String!, $challengeResponse: String!) {
    FundUnpause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const unpause = action
  .schema(UnpauseSchema)
  .outputSchema(z.hashes())
  .action(async ({ parsedInput: { address, pincode }, ctx: { user } }) => {
    const response = await portalClient.request(FundUnpause, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    return z.hashes().parse([response.FundUnpause?.transactionHash]);
  });
