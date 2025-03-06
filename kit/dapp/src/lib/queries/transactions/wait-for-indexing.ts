import {
  theGraphClientKits,
  theGraphGraphqlKits,
} from "@/lib/settlemint/the-graph";
import type { FragmentOf } from "@settlemint/sdk-portal";
import { IndexingFragment } from "./transaction-fragment";

/**
 * Constants for transaction monitoring
 */
const POLLING_DEFAULTS = {
  /** Default timeout in milliseconds (3 minutes) */
  TIMEOUT_MS: 3 * 60 * 1000,
  /** Default polling interval in milliseconds */
  INTERVAL_MS: 500,
} as const;

const GetIndexingStatus = theGraphGraphqlKits(
  `
  query GetIndexingStatus {
    _meta {
      block {
        ...IndexingFragment
      }
    }
  }
`,
  [IndexingFragment]
);

/**
 * Configuration options for transaction monitoring
 */
export interface IndexingMonitoringOptions {
  /** Timeout in milliseconds before giving up */
  timeoutMs?: number;
  /** Polling interval in milliseconds */
  pollingIntervalMs?: number;
}

/**
 * Waits for a single transaction to be mined
 * @internal Use waitForTransactions for external calls
 */
export async function waitForIndexing(
  blockNumber: number,
  options: IndexingMonitoringOptions = {}
) {
  const timeoutMs = options.timeoutMs ?? POLLING_DEFAULTS.TIMEOUT_MS;
  const pollingIntervalMs =
    options.pollingIntervalMs ?? POLLING_DEFAULTS.INTERVAL_MS;

  let indexedBlock: FragmentOf<typeof IndexingFragment> | null = null;
  const startTime = Date.now();

  while (!indexedBlock || indexedBlock.number < blockNumber) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(
        `Transaction indexing timed out after ${timeoutMs / 1000} seconds`
      );
    }

    const status = await theGraphClientKits.request(GetIndexingStatus);
    indexedBlock = status._meta?.block ?? null;

    if ((indexedBlock?.number ?? 0) < blockNumber) {
      await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
    }
  }
  return indexedBlock.number;
}
