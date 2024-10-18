"use server";

import { CreateTokenSchema } from "@/app/wallet/tokens/forms/create-token-form-validation";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/safe-action";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";

// TODO: figure out why the portal cannot estimate the gas, i have to set it myself or it defaults to 90k
const CreateTokenMutation = portalGraphql(`
mutation CreateTokenMutation($address: String!, $from: String!, $name_: String!, $symbol_: String!) {
  StarterKitERC20FactoryCreateToken(
    address: $address
    from: $from
    input: {extraData_: "", name_: $name_, symbol_: $symbol_}
    gasLimit: "2000000"
  ) {
    transactionHash
  }
}
`);

export const createToken = actionClient.schema(CreateTokenSchema).action(async ({ parsedInput }) => {
  const { tokenName, tokenSymbol } = parsedInput;
  console.log("CREATE TOKEN", parsedInput);
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

  console.log("RESULT2", result);
  const transactionHash = result.StarterKitERC20FactoryCreateToken?.transactionHash;

  if (!transactionHash) {
    throw new Error("Transaction hash not found");
  }

  return transactionHash;
});
