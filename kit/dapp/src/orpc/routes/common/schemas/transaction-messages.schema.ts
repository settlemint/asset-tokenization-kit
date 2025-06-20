/**
 * Common Transaction Tracking Messages Schema
 *
 * Provides typed, localized messages for blockchain transaction tracking
 * that are shared across different mutations involving transactions.
 */

import { z } from "zod/v4";

/**
 * Transaction tracking messages with default English values
 * These messages are used during blockchain transaction monitoring
 */
export const TransactionTrackingMessagesSchema = z.object({
  streamTimeout: z
    .string()
    .optional()
    .default("Transaction tracking timed out. Please check the status later."),
  waitingForMining: z
    .string()
    .optional()
    .default("Waiting for transaction to be mined..."),
  transactionFailed: z
    .string()
    .optional()
    .default("Transaction failed. Please try again."),
  transactionDropped: z
    .string()
    .optional()
    .default("Transaction was dropped from the network. Please try again."),
  waitingForIndexing: z
    .string()
    .optional()
    .default("Transaction confirmed. Waiting for indexing..."),
  transactionIndexed: z
    .string()
    .optional()
    .default("Transaction successfully indexed."),
  indexingTimeout: z
    .string()
    .optional()
    .default(
      "Indexing is taking longer than expected. Data will be available soon."
    ),
});

// Type export
export type TransactionTrackingMessages = z.infer<
  typeof TransactionTrackingMessagesSchema
>;
