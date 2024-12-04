'use server';

import { auth } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import { parseEther } from 'viem';
import { TransferTokenSchema } from './transfer-token-form-schema';

const TransferTokenMutation = portalGraphql(`
mutation TransferTokenMutation($address: String!, $from: String!, $to: String!, $amount: String!) {
  StarterKitERC20Transfer(
    address: $address
    from: $from
    input: {to: $to, value: $amount}
  ) {
    transactionHash
  }
}
`);

export const transferTokenAction = actionClient.schema(TransferTokenSchema).action(async ({ parsedInput }) => {
  const { to, amount, tokenAddress } = parsedInput;
  const session = await auth();

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  const result = await portalClient.request(TransferTokenMutation, {
    address: tokenAddress,
    from: session.user.wallet,
    to: to,
    amount: parseEther(amount.toString()).toString(),
  });

  const transactionHash = result.StarterKitERC20Transfer?.transactionHash;

  if (!transactionHash) {
    throw new Error('Transaction hash not found');
  }

  return transactionHash;
});
