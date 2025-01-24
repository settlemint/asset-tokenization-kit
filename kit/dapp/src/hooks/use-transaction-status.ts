import type { TransactionReceiptWithDecodedError } from '@/lib/transactions';
import { useState } from 'react';

export type TransactionStatus =
  | 'Success'
  | 'Pending'
  | 'Reverted' // Specifically for blockchain transaction reversions
  | 'Failed' // For other errors (network, timeout, etc)
  | null;

/**
 * Hook for managing blockchain transaction state with minimal state variables
 */
export function useTransactionStatus() {
  const [transactionHash, setTransactionHash] = useState<string | undefined>(undefined);
  const [transactionReceipt, setTransactionReceipt] = useState<TransactionReceiptWithDecodedError | undefined>(
    undefined
  );
  const [error, setError] = useState<string | undefined>(undefined);

  // Derive status from receipt and error
  const getStatus = (): TransactionStatus => {
    if (error) {
      return 'Failed';
    }
    if (transactionReceipt) {
      return transactionReceipt.status;
    }
    if (transactionHash) {
      return 'Pending';
    }
    return null;
  };

  const status = getStatus();

  const reset = () => {
    setTransactionHash(undefined);
    setTransactionReceipt(undefined);
    setError(undefined);
  };

  return {
    status,
    transactionHash,
    transactionReceipt,
    error,
    setTransactionHash,
    setTransactionReceipt,
    reset,
    // Helper to mark transaction as pending
    pending: (hash: string) => {
      reset();
      setTransactionHash(hash);
    },
    // Helper to mark transaction as complete
    complete: (receipt: TransactionReceiptWithDecodedError) => {
      setTransactionReceipt(receipt);
    },
    // Helper to mark transaction as failed with specific error type
    fail: (message: string) => {
      setError(message);
    },
  };
}
