'use server';

import { auth } from '@/lib/auth/auth';
import { actionClient } from '@/lib/safe-action';
import { portalClient } from '@/lib/settlemint/portal';
import { isAddress } from 'viem';
import { z } from 'zod';
import { SwapBaseToQuote, SwapQuoteToBase } from '../_graphql/mutations';

/** Schema for validating swap transaction parameters */
const SwapParamsSchema = z.object({
  pairAddress: z.string().refine(isAddress, 'Invalid pair address'),
  baseTokenAddress: z.string().refine(isAddress, 'Invalid base token address'),
  quoteTokenAddress: z.string().refine(isAddress, 'Invalid quote token address'),
  from: z.string().refine(isAddress, 'Invalid from address'),
  amount: z.string().min(1, 'Amount is required'),
  minAmount: z.string().min(1, 'Minimum amount is required'),
  isBaseToQuote: z.boolean(),
  deadline: z.string().min(1, 'Deadline is required'),
});

export type SwapParams = z.infer<typeof SwapParamsSchema>;

export const executeSwapAction = actionClient.schema(SwapParamsSchema).action(async ({ parsedInput }) => {
  const { isBaseToQuote, amount, pairAddress, from, minAmount, deadline } = parsedInput;
  const session = await auth();

  if (!session?.user) {
    throw new Error('User not authenticated');
  }

  if (isBaseToQuote) {
    const result = await portalClient.request(SwapBaseToQuote, {
      address: pairAddress,
      from,
      baseAmount: amount,
      minQuoteAmount: minAmount,
      deadline,
    });
    const transactionHash = result.StarterKitERC20DexSwapBaseToQuote?.transactionHash;

    if (!transactionHash) {
      throw new Error('Transaction hash not found');
    }

    return transactionHash;
  }

  const result = await portalClient.request(SwapQuoteToBase, {
    address: pairAddress,
    from,
    quoteAmount: amount,
    minBaseAmount: minAmount,
    deadline,
  });
  const transactionHash = result.StarterKitERC20DexSwapQuoteToBase?.transactionHash;

  if (!transactionHash) {
    throw new Error('Transaction hash not found');
  }

  return transactionHash;
});
