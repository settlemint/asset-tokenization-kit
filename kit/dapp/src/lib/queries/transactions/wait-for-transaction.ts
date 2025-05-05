"use server";

import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import type { FragmentOf } from "gql.tada";
import { ReceiptFragment } from "./transaction-fragment";

const GetTransaction = portalGraphql(
  `
  query GetTransaction($transactionHash: String!) {
    getTransaction(transactionHash: $transactionHash) {
      receipt {
        ...ReceiptFragment
      }
    }
  }
`,
  [ReceiptFragment]
);

type TransactionReceipt = FragmentOf<typeof ReceiptFragment>;

/**
 * Waits for multiple transactions to be mined
 * @param transactionHashes Array of transaction hashes to wait for
 * @param options Configuration options for transaction monitoring
 */
export async function waitForTransactions(
  hashes: string[] | undefined
): Promise<TransactionReceipt[]> {
  if (!hashes || hashes.length === 0) {
    return Promise.resolve([]);
  }

  const promises = hashes.map(async (hash) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait time

    while (attempts < maxAttempts) {
      try {
        // Use Portal GraphQL API directly instead of the API route
        const result = await portalClient.request(GetTransaction, {
          transactionHash: hash,
        });

        // If we have a receipt, the transaction is confirmed
        if (result.getTransaction?.receipt) {
          return result.getTransaction.receipt;
        }

        // If not confirmed yet, wait a bit and try again
        console.log(
          `Waiting for transaction ${hash} confirmation... (Attempt ${attempts + 1}/${maxAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      } catch (error) {
        console.error(`Error checking transaction ${hash}:`, error);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    // If we've reached the maximum number of attempts, throw an error
    throw new Error(`Transaction ${hash} took too long to confirm`);
  });

  return Promise.all(promises);
}
