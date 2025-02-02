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

  constructor(message: string, code: string, context?: Record<string, unknown>) {
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
 * Result of a successful transaction mining operation
 */
export interface TransactionMiningResult {
  receipt: FragmentOf<typeof ReceiptFragment>;
  metadata: Record<string, unknown>;
}

/**
 * Waits for a transaction to be mined and returns the receipt and metadata
 *
 * @param transactionHash - The hash of the transaction to monitor
 * @param options - Optional configuration for the monitoring process
 * @returns Promise resolving to the transaction receipt and metadata
 * @throws {TransactionError} If the transaction fails, times out, or encounters other issues
 *
 * @example
 * ```typescript
 * try {
 *   const result = await waitForTransactionMining(txHash);
 *   console.log('Transaction successful:', result);
 * } catch (error) {
 *   if (error instanceof TransactionError) {
 *     console.error('Transaction failed:', error.message);
 *   }
 * }
 * ```
 */
export async function waitForTransactionMining(
  transactionHash: string,
  options: TransactionMonitoringOptions = {}
): Promise<TransactionMiningResult> {
  const timeoutMs = options.timeoutMs ?? POLLING_DEFAULTS.TIMEOUT_MS;
  const pollingIntervalMs = options.pollingIntervalMs ?? POLLING_DEFAULTS.INTERVAL_MS;

  let receipt: FragmentOf<typeof ReceiptFragment> | null = null;
  let metadata: Record<string, unknown> | null = null;
  const startTime = Date.now();

  while (!receipt) {
    if (Date.now() - startTime > timeoutMs) {
      throw new TransactionError(`Transaction mining timed out after ${timeoutMs / 1000} seconds`, 'TIMEOUT', {
        transactionHash,
      });
    }

    const transaction = await portalClient.request(GetTransaction, { transactionHash });
    receipt = transaction.getTransaction?.receipt ?? null;
    metadata = transaction.getTransaction?.metadata ?? null;

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

    if (!receipt || !metadata) {
      await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
    }
  }

  return { receipt, metadata: metadata ?? {} };
}
