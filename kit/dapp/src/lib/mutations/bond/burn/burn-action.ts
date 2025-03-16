'use server';

import { handleChallenge } from '@/lib/challenge';
import { getBondDetail } from '@/lib/queries/bond/bond-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { parseUnits } from 'viem';
import { action } from '../../safe-action';
import { BurnSchema } from './burn-schema';

/**
 * GraphQL mutation for burning bond tokens
 *
 * @remarks
 * Reduces the total supply of the bond by removing tokens from circulation
 */
const BondBurn = portalGraphql(`
  mutation BondBurn($address: String!, $from: String!, $challengeResponse: String!, $amount: String!) {
    BondBurn(
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
      const { decimals } = await getBondDetail({ address });

      const response = await portalClient.request(BondBurn, {
        address: address,
        from: user.wallet,
        amount: parseUnits(amount.toString(), decimals).toString(),
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.BondBurn?.transactionHash]);
    }
  );
