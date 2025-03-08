"use server";

import { waitForIndexing } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { z } from "@/lib/utils/zod";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  ReceiptFragment,
  ReceiptFragmentSchema,
  type Receipt,
} from "./transaction-fragment";

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
async function waitForSingleTransaction(
  transactionHash: string,
  options: TransactionMonitoringOptions = {}
) {
  const timeoutMs = options.timeoutMs ?? POLLING_DEFAULTS.TIMEOUT_MS;
  const pollingIntervalMs =
    options.pollingIntervalMs ?? POLLING_DEFAULTS.INTERVAL_MS;

  let receipt: Receipt | null = null;
  const startTime = Date.now();

  while (!receipt) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(
        `Transaction mining timed out after ${timeoutMs / 1000} seconds`
      );
    }

    const transaction = await portalClient.request(GetTransaction, {
      transactionHash,
    });
    receipt = transaction.getTransaction?.receipt
      ? ReceiptFragmentSchema.parse(transaction.getTransaction.receipt)
      : null;

    if (receipt?.status === "Reverted") {
      throw new Error(
        `Transaction reverted: ${receipt.revertReasonDecoded ?? "unknown error"}`
      );
    }

    if (!receipt) {
      await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
    }
  }
  return receipt;
}

/**
 * Waits for one or more transactions to be mined
 *
 * @param transactionHashes - Single hash or array of transaction hashes to monitor
 * @param options - Optional configuration for the monitoring process
 * @returns Promise resolving to transaction results
 * @throws {TransactionError} If any transaction fails, times out, or encounters other issues
 */
export async function waitForTransactions(
  transactionHashes: string | string[],
  options: TransactionMonitoringOptions = {}
) {
  const hashes = Array.isArray(transactionHashes)
    ? transactionHashes
    : [transactionHashes];

  const results = await Promise.all(
    hashes.map((hash) => waitForSingleTransaction(hash, options))
  );

  // Sleep for 2 seconds to allow the graph to update
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const response = WaitForTransactionsResponseSchema.parse({
    receipts: results,
    lastTransaction: results.at(-1)!,
  });

  await waitForIndexing(response.lastTransaction.blockNumber);

  // Revalidate all cache tags
  revalidateTag("asset");
  revalidateTag("user-activity");
  // Now revalidate paths after clearing cache
  revalidatePath("/[locale]/assets", "layout");
  revalidatePath("/[locale]/portfolio", "layout");

  return response;
}

const WaitForTransactionsResponseSchema = z.object({
  receipts: z.array(ReceiptFragmentSchema),
  lastTransaction: ReceiptFragmentSchema,
});
