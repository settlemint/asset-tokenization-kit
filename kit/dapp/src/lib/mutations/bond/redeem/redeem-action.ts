'use server';

import { handleChallenge } from '@/lib/challenge';
import { getBondDetail } from '@/lib/queries/bond/bond-detail';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { safeParseTransactionHash, z } from '@/lib/utils/zod';
import { parseUnits } from 'viem';
import { action } from '../../safe-action';
import { RedeemBondSchema } from './redeem-schema';

const BondRedeem = portalGraphql(`
  mutation BondRedeem($address: String!, $from: String!, $challengeResponse: String!, $input: BondRedeemInput!) {
    BondRedeem(
      address: $address
      from: $from
      challengeResponse: $challengeResponse
      input: $input
    ) {
      transactionHash
    }
  }
  `);

export const redeem = action
  .schema(RedeemBondSchema)
  .outputSchema(z.hashes())
  .action(
    async ({ parsedInput: { address, pincode, amount }, ctx: { user } }) => {
      const { decimals } = await getBondDetail({ address });

      const response = await portalClient.request(BondRedeem, {
        address,
        from: user.wallet,
        input: {
          amount: parseUnits(amount.toString(), decimals).toString(),
        },
        challengeResponse: await handleChallenge(user.wallet, pincode),
      });

      return safeParseTransactionHash([response.BondRedeem?.transactionHash]);
    }
  );
