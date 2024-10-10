"use server";

import { setTimeout } from "node:timers/promises";
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

const CreateTokenReceiptQuery = portalGraphql(`
query CreateTokenReceipt($transactionHash: String!) {
  StarterKitERC20FactoryCreateTokenReceipt(transactionHash: $transactionHash) {
    blockNumber
    contractAddress
    status
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

  const startTime = Date.now();
  const timeout = 30000; // 30 seconds

  while (Date.now() - startTime < timeout) {
    const receipt = await portalClient.request(CreateTokenReceiptQuery, {
      transactionHash,
    });

    if (receipt.StarterKitERC20FactoryCreateTokenReceipt) {
      const resolvedReceipt = receipt.StarterKitERC20FactoryCreateTokenReceipt;
      if (resolvedReceipt.status === "Success") {
        return resolvedReceipt;
      }
      throw new Error("Transaction failed");
    }

    // Wait for 500 milliseconds before the next attempt
    await setTimeout(500);
  }

  throw new Error(`Transaction receipt not found within ${timeout / 1000} seconds`);
}
