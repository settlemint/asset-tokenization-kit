'use server';

import { handleChallenge } from '@/lib/challenge';
import { getFundDetail } from '@/lib/queries/fund/fund-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { parseUnits } from 'viem';
import { action } from '../../safe-action';
import { BurnSchema } from './burn-schema';

/**
 * GraphQL mutation to burn fund tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FundBurn = portalGraphql(`
  mutation FundBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    FundBurn(
      address: $address
      from: $from
      input: { value: $amount }
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
      const { decimals } = await getFundDetail({ address });

      const response = await portalClient.request(FundBurn, {
        address: address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.FundBurn?.transactionHash]);
    }
  );
