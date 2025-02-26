import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import type { FragmentOf } from '@settlemint/sdk-portal';

/**
 * Constants for transaction monitoring
 */
const POLLING_DEFAULTS = {
  /** Default timeout in milliseconds (3 minutes) */
  TIMEOUT_MS: 3 * 60 * 1000,
  /** Default polling interval in milliseconds */
  INTERVAL_MS: 500,
} as const;

/**
 * Custom error class for transaction-related errors
 */
export class TransactionError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TransactionError';
    this.code = code;
    this.context = context;
  }
}

const ReceiptFragment = portalGraphql(`
  fragment ReceiptFragment on TransactionReceiptOutput {
    status
    revertReasonDecoded
    contractAddress
    blockNumber
    logs
  }
`);

const GetTransaction = portalGraphql(
  `
  query GetTransaction($transactionHash: String!) {
    getTransaction(transactionHash: $transactionHash) {
      metadata
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
export interface TransactionMonitoringOptions {
  /** Timeout in milliseconds before giving up */
  timeoutMs?: number;
  /** Polling interval in milliseconds */
  pollingIntervalMs?: number;
}

/**
 * Result of a transaction mining operation
 */ interface TransactionMiningResult {
  receipt: FragmentOf<typeof ReceiptFragment>;
}

/**
 * Result of multiple transaction mining operations
 */
export interface TransactionsMiningResult {
  receipts: TransactionMiningResult[];
  /** The last transaction's result, useful for UI updates */
  lastTransaction: TransactionMiningResult;
}

/**
 * Waits for a single transaction to be mined
 * @internal Use waitForTransactions for external calls
 */
async function waitForSingleTransaction(
  transactionHash: string,
  options: TransactionMonitoringOptions = {}
): Promise<TransactionMiningResult> {
  const timeoutMs = options.timeoutMs ?? POLLING_DEFAULTS.TIMEOUT_MS;
  const pollingIntervalMs =
    options.pollingIntervalMs ?? POLLING_DEFAULTS.INTERVAL_MS;

  let receipt: FragmentOf<typeof ReceiptFragment> | null = null;
  const startTime = Date.now();

  while (!receipt) {
    if (Date.now() - startTime > timeoutMs) {
      throw new TransactionError(
        `Transaction mining timed out after ${timeoutMs / 1000} seconds`,
        'TIMEOUT',
        {
          transactionHash,
        }
      );
    }

    const transaction = await portalClient.request(GetTransaction, {
      transactionHash,
    });
    receipt = transaction.getTransaction?.receipt ?? null;

    if (receipt?.status === 'Reverted') {
      throw new TransactionError(
        `Transaction reverted: ${receipt.revertReasonDecoded ?? 'Unknown error'}`,
        'REVERTED',
        {
          transactionHash,
          blockNumber: receipt.blockNumber,
          contractAddress: receipt.contractAddress ?? 'N/A',
          revertReason: receipt.revertReasonDecoded,
        }
      );
    }

    if (!receipt) {
      await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
    }
  }

  return { receipt };
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
): Promise<TransactionsMiningResult> {
  const hashes = Array.isArray(transactionHashes)
    ? transactionHashes
    : [transactionHashes];

  const results = await Promise.all(
    hashes.map((hash) => waitForSingleTransaction(hash, options))
  );

  // Sleep for 2 seconds to allow the graph to update
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    receipts: results,
    lastTransaction: results.at(-1)!,
  };
}
