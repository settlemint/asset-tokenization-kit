'use server';
import { ApproveOutputSchema } from '@/components/blocks/asset-approve/schema';
import { handleChallenge } from '@/lib/challenge';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { type Address, parseUnits } from 'viem';
import { getApproveFormSchema } from './schema';

const CryptoCurrencyApprove = portalGraphql(`
mutation CryptoCurrencyApprove($address: String!, $from: String!, $challengeResponse: String!, $amount: String!, $to: String!) {
  CryptoCurrencyApprove(
    address: $address
    from: $from
    input: {spender: $to, value: $amount}
    challengeResponse: $challengeResponse
  ) {
    transactionHash
  }
}
`);

export const approveCryptocurrency = actionClient
  .schema(getApproveFormSchema())
  .outputSchema(ApproveOutputSchema)
  .action(async ({ parsedInput: { address, to, amount, pincode, decimals }, ctx: { user } }) => {
    const data = await portalClient.request(CryptoCurrencyApprove, {
      address: address,
      from: user.wallet,
      to: to,
      amount: parseUnits(amount.toString(), decimals).toString(),
      challengeResponse: await handleChallenge(user.wallet as Address, pincode),
    });

    const transactionHash = data.CryptoCurrencyApprove?.transactionHash;
    if (!transactionHash) {
      throw new Error('Failed to send the transaction to approve the asset');
    }

    return transactionHash;
  });
