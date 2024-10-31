"use server";

import { auth } from "@/lib/auth/auth";
import { actionClient } from "@/lib/safe-action";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { parseEther } from "viem";
import { StakeTokenSchema } from "./stake-token-form-schema";

const AddLiquidityMutation = portalGraphql(`
mutation AddLiquidity($address: String!, $from: String!, $baseAmount: String!, $quoteAmount: String!) {
  StarterKitERC20DexAddLiquidity(
    address: $address
    from: $from
    input: {baseAmount: $baseAmount, quoteAmount: $quoteAmount}
  ) {
    transactionHash
  }
}
`);

export const stakeTokenAction = actionClient.schema(StakeTokenSchema).action(async ({ parsedInput }) => {
  const { quoteAmount, baseAmount, tokenAddress } = parsedInput;
  const session = await auth();

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const result = await portalClient.request(AddLiquidityMutation, {
    address: tokenAddress,
    from: session.user.wallet,
    baseAmount: parseEther(baseAmount.toString()).toString(),
    quoteAmount: parseEther(quoteAmount.toString()).toString(),
  });

  const transactionHash = result.StarterKitERC20DexAddLiquidity?.transactionHash;

  if (!transactionHash) {
    throw new Error("Transaction hash not found");
  }

  return transactionHash;
});
