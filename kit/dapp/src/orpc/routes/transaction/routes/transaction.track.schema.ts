/**
 * Transaction Tracking Schemas
 *
 * This module defines the schemas for transaction tracking operations, including
 * both the input parameters for initiating tracking and the output status updates
 * that are streamed to clients via Server-Sent Events.
 *
 * The schemas support tracking both blockchain transaction states and subsequent
 * indexing operations, providing comprehensive feedback throughout the entire
 * transaction lifecycle.
 */

import { ethereumHash } from "@/lib/zod/validators/ethereum-hash";
import { z } from "zod/v4";

/**
 * Transaction status update schema.
 *
 * Represents a single status update event in the transaction tracking stream.
 * Uses a discriminated union to ensure type safety across different status types,
 * with each status having its own specific fields.
 *
 * Status types:
 * - pending: Transaction submitted and awaiting confirmation
 * - confirmed: Transaction successfully included in a block
 * - failed: Transaction failed or was rejected
 *
 * @example
 * ```typescript
 * // Pending status
 * { transactionHash: "0x123...", status: "pending", message: "Transaction submitted" }
 *
 * // Confirmed status
 * { transactionHash: "0x123...", status: "confirmed", message: "Transaction confirmed in block 12345" }
 *
 * // Failed status
 * { transactionHash: "0x123...", status: "failed", reason: "Insufficient gas" }
 * ```
 */
export const TransactionStatusSchema = z.discriminatedUnion("status", [
  z.object({
    transactionHash: ethereumHash,
    status: z.literal("pending"),
  }),
  z.object({
    transactionHash: ethereumHash,
    status: z.literal("confirmed"),
  }),
  z.object({
    transactionHash: ethereumHash,
    status: z.literal("failed"),
    reason: z.string(),
  }),
]);

/**
 * Transaction tracking input schema.
 *
 * Defines the parameters required to initiate transaction tracking, including
 * the transaction hash to monitor and customizable status messages for different
 * stages of the transaction lifecycle.
 *
 * The messages object allows clients to customize the user-facing messages
 * for different transaction and indexing states, supporting internationalization
 * and context-specific messaging.
 *
 * @example
 * ```typescript
 * const input = {
 *   transactionHash: "0x123...",
 * };
 * ```
 */
export const TransactionStatusInputSchema = z.object({
  /**
   * The blockchain transaction hash to track.
   * Must be a valid Ethereum transaction hash (0x-prefixed, 32 bytes).
   */
  transactionHash: ethereumHash,
});
