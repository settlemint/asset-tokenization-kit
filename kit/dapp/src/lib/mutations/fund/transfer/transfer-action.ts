'use server';

import { handleChallenge } from '@/lib/challenge';
import { getFundDetail } from '@/lib/queries/fund/fund-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { z } from '@/lib/utils/zod';
import { parseUnits } from 'viem';
import { action } from '../../safe-action';
import { TransferFundSchema } from './transfer-schema';

/**
 * GraphQL mutation to transfer fund tokens
 *
 * @remarks
 * This mutation requires authentication via challenge response
 */
const FundTransfer = portalGraphql(`
  mutation FundTransfer($address: String!, $from: String!, $challengeResponse: String!, $value: String!, $to: String!) {
    Transfer: FundTransfer(
      address: $address
      from: $from
      input: { to: $to, value: $value }
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const transfer = action
  .schema(TransferFundSchema)
  .outputSchema(z.hashes())
  .action(
    async ({ parsedInput: { address, pincode, value, to }, ctx: { user } }) => {
      const { decimals } = await getFundDetail({ address });

      const response = await portalClient.request(FundTransfer, {
        address,
        from: user.wallet,
        value: parseUnits(value.toString(), decimals).toString(),
        to,
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return z.hashes().parse([response.Transfer?.transactionHash]);
    }
  );
