'use server';

import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { PauseSchema } from './pause-schema';

/**
 * GraphQL mutation for pausing a stablecoin contract
 *
 * @remarks
 * Temporarily suspends all transfers and operations on the stablecoin
 */
const StableCoinPause = portalGraphql(`
  mutation StableCoinPause($address: String!, $from: String!, $challengeResponse: String!) {
    StableCoinPause(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const pause = action
  .schema(PauseSchema)
  .outputSchema(z.hashes())
  .action(async ({ parsedInput: { address, pincode }, ctx: { user } }) => {
    const response = await portalClient.request(StableCoinPause, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    return z.hashes().parse([response.StableCoinPause?.transactionHash]);
  });
