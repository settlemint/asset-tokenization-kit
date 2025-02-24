'use server';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { ApproveOutputSchema, getApproveFormSchema } from './schema';

const BondApprove = portalGraphql(`
mutation BondApprove($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
  BondApprove(
    address: $address
    from: $from
    input: {spender: $to, value: $amount}
    challengeResponse: $challengeResponse
  ) {
    transactionHash
  }
}
`);

export const approveBond = actionClient
  .schema(getApproveFormSchema())
  .outputSchema(ApproveOutputSchema)
  .action(async ({ parsedInput: { address, to, amount, pincode, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(BondApprove, {
      address: address,
      from: user.wallet,
      to: to,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.BondApprove?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to approve the asset');
    }

    return transactionHash;
  });
