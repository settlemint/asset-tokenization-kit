'use server';

import { handleChallenge } from '@/lib/challenge';
import { getFundDetail } from '@/lib/queries/fund/fund-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { parseUnits } from 'viem';
import { action } from '../../safe-action';
import { FreezeSchema } from './freeze-schema';

/**
 * GraphQL mutation to freeze tokens for a user
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FundFreeze = portalGraphql(`
  mutation FundFreeze($address: String!, $from: String!, $challengeResponse: String!, $user: String!, $amount: String!) {
    FundFreeze(
      address: $address
      from: $from
      input: {user: $user, amount: $amount}
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const freeze = action
  .schema(FreezeSchema)
  .outputSchema(z.hashes())
  .action(
    async ({
      parsedInput: { address, pincode, user, amount },
      ctx: { user: currentUser },
    }) => {
      const { decimals } = await getFundDetail({ address });

      const response = await portalClient.request(FundFreeze, {
        address: address,
        from: currentUser.wallet,
        user,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(currentUser.wallet, pincode),
      });

      return z.hashes().parse([response.FundFreeze?.transactionHash]);
    }
  );
