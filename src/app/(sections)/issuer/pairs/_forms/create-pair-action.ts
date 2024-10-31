"use server";

import { auth } from "@/lib/auth/auth";
import { actionClient } from "@/lib/safe-action";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { CreateDexPairSchema } from "./create-pair-form-schema";

// TODO: figure out why the portal cannot estimate the gas, i have to set it myself or it defaults to 90k
const CreateDexPairMutation = portalGraphql(`
mutation CreateDexPairMutation($address: String!, $from: String!, $baseToken: String!, $quoteToken: String!) {
  StarterKitERC20DexFactoryCreatePair(
    address: $address
    from: $from
    input: {quoteToken: $quoteToken, baseToken: $baseToken}
    gasLimit: "4000000"
  ) {
    transactionHash
  }
}
`);

export const createTokenAction = actionClient.schema(CreateDexPairSchema).action(async ({ parsedInput }) => {
  const { baseTokenAddress, quoteTokenAddress } = parsedInput;
  const session = await auth();

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const result = await portalClient.request(CreateDexPairMutation, {
    address: process.env.SETTLEMINT_PREDEPLOYED_CONTRACT_ERC20_DEX_FACTORY!,
    from: session.user.wallet,
    baseToken: baseTokenAddress,
    quoteToken: quoteTokenAddress,
  });

  const transactionHash = result.StarterKitERC20DexFactoryCreatePair?.transactionHash;

  if (!transactionHash) {
    throw new Error("Transaction hash not found");
  }

  return transactionHash;
});
