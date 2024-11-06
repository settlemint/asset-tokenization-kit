"use server";

import { approveTokenAction } from "@/app/(sections)/issuer/pairs/[address]/details/_forms/approve-token-action";
import { portalClient } from "@/lib/settlemint/portal";
import type { Address } from "viem";
import { SwapBaseToQuote, SwapQuoteToBase } from "../_graphql/mutations";

interface SwapParams {
  pairAddress: string;
  baseTokenAddress: string;
  quoteTokenAddress: string;
  from: Address;
  amount: string;
  minAmount: string;
  isBaseToQuote: boolean;
  deadline: string;
}

export async function executeSwap({
  pairAddress,
  baseTokenAddress,
  quoteTokenAddress,
  from,
  amount,
  minAmount,
  isBaseToQuote,
  deadline,
}: SwapParams) {
  if (isBaseToQuote) {
    await approveTokenAction({
      tokenAddress: baseTokenAddress,
      spender: pairAddress,
      approveAmount: Number.parseFloat(amount),
    });

    const result = await portalClient.request(SwapBaseToQuote, {
      address: pairAddress,
      from,
      baseAmount: amount,
      minQuoteAmount: minAmount,
      deadline,
    });
    const transactionHash = result.StarterKitERC20DexSwapBaseToQuote?.transactionHash;

    if (!transactionHash) {
      throw new Error("Transaction hash not found");
    }

    return transactionHash;
  }

  await approveTokenAction({
    tokenAddress: quoteTokenAddress,
    spender: pairAddress,
    approveAmount: Number.parseFloat(amount),
  });

  const result = await portalClient.request(SwapQuoteToBase, {
    address: pairAddress,
    from,
    quoteAmount: amount,
    minBaseAmount: minAmount,
    deadline,
  });
  const transactionHash = result.StarterKitERC20DexSwapQuoteToBase?.transactionHash;

  if (!transactionHash) {
    throw new Error("Transaction hash not found");
  }

  return transactionHash;
}
