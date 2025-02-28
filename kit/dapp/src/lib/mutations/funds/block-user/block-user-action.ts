'use server';

import { handleChallenge } from '@/lib/challenge';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { action } from '../../safe-action';
import { BlockUserSchema } from './block-user-schema';

/**
 * GraphQL mutation to block a user from interacting with a fund
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FundBlockUser = portalGraphql(`
  mutation FundBlockUser($address: String!, $from: String!, $challengeResponse: String!, $user: String!) {
    FundBlockUser(
      address: $address
      from: $from
      input: {user: $user}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const blockUser = action
  .schema(BlockUserSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, user },
      ctx: { user: currentUser },
    }) => {
      const response = await portalClient.request(FundBlockUser, {
        address: address,
        from: currentUser.wallet,
        user,
        challengeResponse: await handleChallenge(currentUser.wallet, pincode),
      });

      return z.hashes().parse([response.FundBlockUser?.transactionHash]);
    }
  );
