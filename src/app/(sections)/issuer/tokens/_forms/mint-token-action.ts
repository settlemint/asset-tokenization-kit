"use server";

import { auth } from "@/lib/auth/auth";
import { actionClient } from "@/lib/safe-action";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { MintTokenSchema } from "./mint-token-form-schema";

// TODO: figure out why the portal cannot estimate the gas, i have to set it myself or it defaults to 90k
const MintTokenMutation = portalGraphql(`
mutation MintTokenMutation($address: String!, $from: String!, $to: String!, $amount: String!) {
  StarterKitERC20Mint(
    from: $from
    address: $address
    input: {amount: $amount, to: $to}
  ) {
    transactionHash
  }
}
`);

export const mintTokenAction = actionClient.schema(MintTokenSchema).action(async ({ parsedInput }) => {
  const { to, amount } = parsedInput;
  const session = await auth();

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const result = await portalClient.request(MintTokenMutation, {
    address: process.env.SETTLEMINT_PREDEPLOYED_CONTRACT_ERC20_FACTORY!,
    from: session.user.wallet,
    to: to,
    amount: String(amount),
  });

  const transactionHash = result.StarterKitERC20Mint?.transactionHash;

  if (!transactionHash) {
    throw new Error("Transaction hash not found");
  }

  return transactionHash;
});
