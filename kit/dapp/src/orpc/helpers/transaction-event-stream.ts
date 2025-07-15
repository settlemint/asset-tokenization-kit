import type { TransactionEventEmitted } from "@/orpc/middlewares/services/portal.middleware";

/**
 * Standard messages for transaction event streaming
 */
export interface TransactionEventMessages {
  /** Message shown when preparing the operation */
  preparing?: string;
  /** Message shown when submitting the transaction */
  submitting?: string;
  /** Message shown while waiting for mining */
  waitingForMining?: string;
  /** Message shown when operation is complete */
  complete?: string;
  /** Message shown when operation fails */
  failed?: string;
  /** Message shown while waiting for indexing */
  waitingForIndexing?: string;
  /** Message shown when indexing completes */
  transactionIndexed?: string;
  /** Message shown when indexing times out */
  indexingTimeout?: string;
  /** Message shown when tracking times out */
  streamTimeout?: string;
  /** Message shown when transaction is dropped */
  transactionDropped?: string;
  /** Default error message */
  defaultError?: string;
}

/**
 * Default messages for different types of operations
 */
export const DEFAULT_TRANSACTION_MESSAGES: Record<
  string,
  TransactionEventMessages
> = {
  mint: {
    preparing: "Preparing token mint...",
    submitting: "Submitting mint transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Token mint completed successfully",
    failed: "Failed to mint tokens",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during minting",
  },
  burn: {
    preparing: "Preparing token burn...",
    submitting: "Submitting burn transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Token burn completed successfully",
    failed: "Failed to burn tokens",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during burning",
  },
  transfer: {
    preparing: "Preparing token transfer...",
    submitting: "Submitting transfer transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Token transfer completed successfully",
    failed: "Failed to transfer tokens",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during transfer",
  },
  approve: {
    preparing: "Preparing approval...",
    submitting: "Submitting approval transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Approval completed successfully",
    failed: "Failed to approve tokens",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during approval",
  },
  freeze: {
    preparing: "Preparing account freeze...",
    submitting: "Submitting freeze transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Account freeze completed successfully",
    failed: "Failed to freeze account",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during freeze",
  },
  pause: {
    preparing: "Preparing token pause...",
    submitting: "Submitting pause transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Token pause completed successfully",
    failed: "Failed to pause token",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during pause",
  },
  redeem: {
    preparing: "Preparing token redemption...",
    submitting: "Submitting redemption transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Token redemption completed successfully",
    failed: "Failed to redeem tokens",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during redemption",
  },
  recovery: {
    preparing: "Preparing token recovery...",
    submitting: "Submitting recovery transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Token recovery completed successfully",
    failed: "Failed to recover tokens",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during recovery",
  },
  setCap: {
    preparing: "Preparing cap update...",
    submitting: "Submitting cap update transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Cap update completed successfully",
    failed: "Failed to update cap",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during cap update",
  },
  setYield: {
    preparing: "Preparing yield schedule update...",
    submitting: "Submitting yield schedule transaction...",
    waitingForMining: "Waiting for transaction to be mined...",
    complete: "Yield schedule updated successfully",
    failed: "Failed to update yield schedule",
    waitingForIndexing: "Transaction confirmed. Waiting for indexing...",
    transactionIndexed: "Transaction successfully indexed.",
    indexingTimeout:
      "Indexing is taking longer than expected. Data will be available soon.",
    streamTimeout:
      "Transaction tracking timed out. Please check the status later.",
    transactionDropped:
      "Transaction was dropped from the network. Please try again.",
    defaultError: "An unexpected error occurred during yield update",
  },
};

/**
 * Helper to merge custom messages with defaults
 */
export function mergeTransactionMessages(
  operation: string,
  customMessages?: Partial<TransactionEventMessages>
): TransactionEventMessages {
  const defaults =
    DEFAULT_TRANSACTION_MESSAGES[operation] ||
    DEFAULT_TRANSACTION_MESSAGES.transfer;
  return {
    ...defaults,
    ...customMessages,
  };
}

/**
 * Helper to format transaction event messages consistently
 */
export function formatTransactionEvent(
  status: TransactionEventEmitted["status"],
  message: string,
  transactionHash: string
): TransactionEventEmitted {
  return {
    status,
    message,
    transactionHash,
  };
}

/**
 * Helper to get message key for portal client tracking
 */
export function getPortalTrackingMessages(messages: TransactionEventMessages): {
  streamTimeout?: string;
  waitingForMining?: string;
  transactionFailed?: string;
  transactionDropped?: string;
  waitingForIndexing?: string;
  transactionIndexed?: string;
  indexingTimeout?: string;
} {
  return {
    streamTimeout: messages.streamTimeout,
    waitingForMining: messages.waitingForMining,
    transactionFailed: messages.failed,
    transactionDropped: messages.transactionDropped,
    waitingForIndexing: messages.waitingForIndexing,
    transactionIndexed: messages.transactionIndexed,
    indexingTimeout: messages.indexingTimeout,
  };
}
