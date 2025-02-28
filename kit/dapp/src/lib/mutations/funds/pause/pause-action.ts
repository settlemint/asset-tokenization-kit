'use server';

import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { PauseSchema } from './pause-schema';

/**
 * GraphQL mutation to pause a fund
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FundPause = portalGraphql(`
  mutation FundPause($address: String!, $from: String!, $challengeResponse: String!) {
    FundPause(
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
    const response = await portalClient.request(FundPause, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet, pincode),
    });

    return z.hashes().parse([response.FundPause?.transactionHash]);
  });
