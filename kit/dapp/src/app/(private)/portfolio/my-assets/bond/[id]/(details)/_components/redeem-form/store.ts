'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { RedeemOutputSchema, getRedeemFormSchema } from './schema';

const BondRedeemMutation = portalGraphql(`
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

interface BondRedeemResponse {
  BondRedeem: {
    transactionHash: string;
  } | null;
}

export const redeemBond = actionClient
  .schema(getRedeemFormSchema())
  .outputSchema(RedeemOutputSchema)
  .action(async ({ parsedInput: { address, amount, pincode, decimals }, ctx: { user } }) => {
    const data = (await portalClient.request(BondRedeemMutation, {
      address: address,
      from: user.wallet,
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
      input: {
        amount: parseUnits(amount.toString(), decimals).toString(),
      },
    })) as BondRedeemResponse;

    const transactionHash = data.BondRedeem?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to redeem the bond');
    }

    return transactionHash;
  });
