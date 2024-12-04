'use server';

import { auth } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { parseEther } from 'viem';
import { ApproveTokenSchema } from './approve-token-schema';

const ApproveTokenMutation = portalGraphql(`
mutation ApproveToken($address: String!, $from: String!, $spender: String!, $value: String!) {
  StarterKitERC20Approve(
    address: $address
    from: $from
    input: {spender: $spender, value: $value}
  ) {
    transactionHash
  }
}
`);

export const approveTokenAction = actionClient.schema(ApproveTokenSchema).action(async ({ parsedInput }) => {
  const { spender, approveAmount, tokenAddress } = parsedInput;
  const session = await auth();

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const result = await portalClient.request(ApproveTokenMutation, {
    address: tokenAddress,
    from: session.user.wallet,
    spender,
    value: parseEther(approveAmount.toString()).toString(),
  });

  const transactionHash = result.StarterKitERC20Approve?.transactionHash;

  if (!transactionHash) {
    throw new Error('Transaction hash not found');
  }

  return transactionHash;
});
