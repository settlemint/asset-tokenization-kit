"use server";

import type { TokenizationWizardSchema } from "@/app/wallet/tokens/forms/create-token-form-validation";
import { auth } from "@/lib/auth";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";

const CreateTokenMutation = portalGraphql(`
mutation CreateTokenMutation($address: String!, $from: String!, $name_: String!, $symbol_: String!) {
  StarterKitERC20FactoryCreateToken(
    address: $address
    from: $from
    input: {extraData_: "", name_: $name_, symbol_: $symbol_}
  ) {
    transactionHash
  }
}
`);

export async function createToken(data: TokenizationWizardSchema) {
  const { tokenName, tokenSymbol } = data;
  const session = await auth();

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const result = await portalClient.request(CreateTokenMutation, {
    address: process.env.SETTLEMINT_PREDEPLOYED_CONTRACT_ERC20_FACTORY!,
    from: session.user.wallet,
    name_: tokenName,
    symbol_: tokenSymbol,
  });

  const transactionHash = result.StarterKitERC20FactoryCreateToken?.transactionHash;

  if (!transactionHash) {
    throw new Error("Transaction hash not found");
  }

  return transactionHash;
}
