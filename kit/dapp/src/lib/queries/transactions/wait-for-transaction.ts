"use server";

import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import type { FragmentOf } from "gql.tada";
import { ReceiptFragment, ReceiptFragmentSchema } from "./transaction-fragment";

/**
 * Constants for transaction monitoring
 */
const POLLING_DEFAULTS = {
  /** Default timeout in milliseconds (3 minutes) */
  TIMEOUT_MS: 3 * 60 * 1000,
  /** Default polling interval in milliseconds */
  INTERVAL_MS: 500,
} as const;

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
 * Configuration options for transaction monitoring
 */
interface TransactionMonitoringOptions {
  /** Timeout in milliseconds before giving up */
  timeoutMs?: number;
  /** Polling interval in milliseconds */
  pollingIntervalMs?: number;
}

/**
 * Waits for a single transaction to be mined
 * @internal Use waitForTransactions for external calls
 */
export async function waitForSingleTransaction(
  transactionHash: string,
  options: TransactionMonitoringOptions = {}
): Promise<TransactionReceipt> {
  const timeoutMs = options.timeoutMs ?? POLLING_DEFAULTS.TIMEOUT_MS;
  const pollingIntervalMs =
    options.pollingIntervalMs ?? POLLING_DEFAULTS.INTERVAL_MS;

  const startTime = Date.now();

  let receipt: TransactionReceipt | null = null;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const result = await portalClient.request(GetTransaction, {
        transactionHash,
      });

      if (result.getTransaction?.receipt) {
        // We have a receipt, means the transaction was mined
        receipt = result.getTransaction.receipt;
        break;
      }
    } catch (error) {
      console.error(
        `Error while waiting for transaction ${transactionHash}:`,
        error
      );
      // Continue polling even if there's an error
    }

    // Wait for the specified polling interval
    await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
  }

  if (!receipt) {
    throw new Error(
      `Transaction ${transactionHash} was not mined within the timeout period`
    );
  }

  return receipt;
}

/**
 * Waits for multiple transactions to be mined
 * @param transactionHashes Array of transaction hashes to wait for
 * @param options Configuration options for transaction monitoring
 */
export async function waitForTransactions(
  hashes: string[] | undefined
): Promise<void> {
  if (!hashes || hashes.length === 0) {
    return Promise.resolve();
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
          return Promise.resolve();
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

  return Promise.all(promises).then(() => Promise.resolve());
}

const WaitForTransactionsResponseSchema = t.Object({
  receipts: t.Array(ReceiptFragmentSchema, {
    description:
      "Array of transaction receipts for all the processed transactions",
  }),
  lastTransaction: ReceiptFragmentSchema,
});

export type WaitForTransactionsResponse = StaticDecode<
  typeof WaitForTransactionsResponseSchema
>;
