'use server';

import { handleChallenge } from '@/lib/challenge';
import { getBondDetail } from '@/lib/queries/bond/bond-detail';
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
const BondFreeze = portalGraphql(`
  mutation BondFreeze($address: String!, $from: String!, $challengeResponse: String!, $user: String!, $amount: String!) {
    BondFreeze(
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
      const { decimals } = await getBondDetail({ address });

      const response = await portalClient.request(BondFreeze, {
        address: address,
        from: currentUser.wallet,
        user,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(currentUser.wallet, pincode),
      });

      return z.hashes().parse([response.BondFreeze?.transactionHash]);
    }
  );
