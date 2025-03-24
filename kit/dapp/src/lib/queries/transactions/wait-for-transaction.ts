"use server";

import { waitForIndexing } from "@/lib/queries/transactions/wait-for-indexing";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
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
export async function waitForSingleTransaction(
  transactionHash: string,
  options: TransactionMonitoringOptions = {}
): Promise<Receipt> {
  const timeoutMs = options.timeoutMs ?? POLLING_DEFAULTS.TIMEOUT_MS;
  const pollingIntervalMs =
    options.pollingIntervalMs ?? POLLING_DEFAULTS.INTERVAL_MS;

  const startTime = Date.now();

  let receipt: Receipt | null = null;

  while (Date.now() - startTime < timeoutMs) {
    try {
      const result = await portalClient.request(GetTransaction, {
        transactionHash,
      });

      if (result.getTransaction?.receipt) {
        // We have a receipt, means the transaction was mined
        receipt = safeParse(
          ReceiptFragmentSchema,
          result.getTransaction.receipt
        );
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
  transactionHashes: string[],
  options: TransactionMonitoringOptions = {}
) {
  if (!transactionHashes.length) {
    throw new Error("No transaction hashes provided");
  }

  // Wait for all transactions to be mined in parallel
  const results = await Promise.all(
    transactionHashes.map((hash) => waitForSingleTransaction(hash, options))
  );

  const response = WaitForTransactionsResponseSchema.parse({
    receipts: results,
    lastTransaction: results.at(-1),
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
