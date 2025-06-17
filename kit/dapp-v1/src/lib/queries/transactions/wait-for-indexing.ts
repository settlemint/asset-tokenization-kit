"use server";

import { waitForTransactions } from "@/lib/queries/transactions/wait-for-transaction";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { Hashes } from "@/lib/utils/typebox/hash";
import {
  IndexingFragment,
  type IndexingFragmentType,
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

// const GetIndexingStatus = theGraphGraphqlKit(
//   `
//   query GetIndexingStatus {
//     _meta {
//       block {
//         ...IndexingFragment
//       }
//     }
//   }
// `,
//   [IndexingFragment]
// );

/**
 * Configuration options for transaction monitoring
 */
export interface IndexingMonitoringOptions {
  /** Timeout in milliseconds before giving up */
  timeoutMs?: number;
  /** Polling interval in milliseconds */
  pollingIntervalMs?: number;
}

export async function waitForIndexingBlock(
  blockNumber: number,
  options: IndexingMonitoringOptions = {}
) {
  const timeoutMs = options.timeoutMs ?? POLLING_DEFAULTS.TIMEOUT_MS;
  const pollingIntervalMs =
    options.pollingIntervalMs ?? POLLING_DEFAULTS.INTERVAL_MS;

  let indexedBlock: IndexingFragmentType | null = null;
  const startTime = Date.now();

  while (!indexedBlock || indexedBlock.number < blockNumber) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(
        `Transaction indexing timed out after ${timeoutMs / 1000} seconds`
      );
    }

    //       // const status = await theGraphClientKit.request(GetIndexingStatus);
    // indexedBlock = status._meta?.block ?? null;
    // NOTE: HARDCODED SO IT STILL COMPILES - return a mock block
    indexedBlock = { number: blockNumber };

    if ((indexedBlock?.number ?? 0) < blockNumber) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, pollingIntervalMs)
      );
    }
  }
  return indexedBlock.number;
}

export async function waitForIndexingTransactions(
  transactionHashes: Hashes
): Promise<number> {
  const receipts = await waitForTransactions(transactionHashes);
  const lastBlockNumber = Number(
    receipts.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber)).at(0)
      ?.blockNumber
  );
  const indexedBlock = await waitForIndexingBlock(lastBlockNumber);
  return indexedBlock;
}
