import type { useTransactionStatus } from '@/hooks/use-transaction-status';

export interface TransactionReceiptWithDecodedError {
  blockNumber: string;
  status: 'Success' | 'Reverted';
  revertReasonDecoded?: string | null;
  contractAddress?: string | null;
}

class TransactionFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionFailedError';
  }
}

function checkReceipt(receipt: TransactionReceiptWithDecodedError) {
  if (receipt.status === 'Success') {
    return receipt;
  }
  if (receipt.revertReasonDecoded) {
    throw new TransactionFailedError(`Transaction failed: ${receipt.revertReasonDecoded}`);
  }
  throw new TransactionFailedError('Transaction failed');
}

export interface WaitForTransactionReceiptOptions {
  receiptFetcher: () => Promise<TransactionReceiptWithDecodedError | undefined | null>;
}

export async function waitForTransactionReceipt(options: WaitForTransactionReceiptOptions) {
  const startTime = Date.now();
  const timeout = 240000; // 4 minutes

  while (Date.now() - startTime < timeout) {
    try {
      const receipt = await options.receiptFetcher();
      if (receipt) {
        return checkReceipt(receipt);
      }
    } catch (error) {
      if (error instanceof TransactionFailedError) {
        throw error;
      }
      // retry
    }

    // Wait for 500 milliseconds before the next attempt
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Transaction not processed within ${timeout / 1000} seconds`);
}

/**
 * Handles a blockchain transaction lifecycle with status management
 */
export async function handleTransaction({
  transactionState,
  hash,
  receiptFetcher,
  options,
}: {
  transactionState: ReturnType<typeof useTransactionStatus>;
  hash?: string;
  options?: {
    onSuccess?: (receipt: TransactionReceiptWithDecodedError) => void;
    onError?: (error: unknown) => void;
  };
} & WaitForTransactionReceiptOptions) {
  const { onSuccess, onError } = options || {};
  if (!hash) {
    transactionState.fail('Could not create transaction');
    return;
  }

  transactionState.pending(hash);

  try {
    const receipt = await waitForTransactionReceipt({
      receiptFetcher,
    });
    transactionState.complete(receipt);
    onSuccess?.(receipt);
    return receipt;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    transactionState.fail(errorMessage);
    onError?.(error);
  }
}
