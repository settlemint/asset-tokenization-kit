'use server';

import { handleChallenge } from '@/lib/challenge';
import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { parseUnits } from 'viem';
import { action } from '../../safe-action';
import { BurnSchema } from './burn-schema';

/**
 * GraphQL mutation for burning stablecoin tokens
 *
 * @remarks
 * Reduces the total supply of the stablecoin by removing tokens from circulation
 */
const StableCoinBurn = portalGraphql(`
  mutation StableCoinBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
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

export const burn = action
  .schema(BurnSchema)
  .outputSchema(z.hashes())
  .action(
    async ({ parsedInput: { address, pincode, amount }, ctx: { user } }) => {
      const { decimals } = await getStableCoinDetail({ address });

      const response = await portalClient.request(StableCoinBurn, {
        address: address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.StableCoinBurn?.transactionHash]);
    }
  );
