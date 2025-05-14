import { waitForTransactionReceipt } from "@settlemint/sdk-portal";
import type { Address } from "viem";

export async function waitForContractToBeDeployed(
  transactionHash: string | null | undefined
) {
  if (!transactionHash) {
    throw new Error("Transaction hash is required");
  }

  const transaction = await waitForTransactionReceipt(transactionHash, {
    accessToken: process.env.SETTLEMINT_ACCESS_TOKEN!,
    portalGraphqlEndpoint: process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT!,
  });

  if (transaction.receipt.status.toLowerCase() !== "success") {
    throw new Error(`Failed to deploy contract (hash: ${transactionHash})`);
  }

  return transaction.receipt.contractAddress as Address;
}

export async function waitForTransactionToBeMined(
  transactionHash: string | null | undefined
) {
  if (!transactionHash) {
    throw new Error("Transaction hash is required");
  }

  const transaction = await waitForTransactionReceipt(transactionHash, {
    accessToken: process.env.SETTLEMINT_ACCESS_TOKEN!,
    portalGraphqlEndpoint: process.env.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT!,
  });
  if (transaction.receipt.status.toLowerCase() !== "success") {
    throw new Error(`Failed to mine transaction (hash: ${transactionHash})`);
  }
}
