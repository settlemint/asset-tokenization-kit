/**
 * Transaction Management Contract
 *
 * This contract defines the type-safe interfaces for transaction-related operations.
 * It provides endpoints for tracking blockchain transactions in real-time, allowing
 * clients to monitor the status of their operations from submission through to
 * confirmation on the blockchain.
 *
 * The contract uses Server-Sent Events (SSE) to stream transaction status updates,
 * providing real-time feedback on transaction progress including submission,
 * mining, and confirmation states.
 *
 * @see {@link @/orpc/procedures/auth.contract} - Base authenticated contract
 * @see {@link ./transaction.router} - Implementation router
 */

import { ac } from "@/orpc/procedures/auth.contract";
import {
  TransactionStatusInputSchema,
  TransactionStatusSchema,
} from "@/orpc/routes/transaction/routes/transaction.track.schema";
import { eventIterator } from "@orpc/contract";

/**
 * Track blockchain transaction status in real-time.
 *
 * This endpoint provides real-time updates on transaction status using
 * Server-Sent Events. It monitors transactions from submission through
 * to final confirmation, providing updates on:
 * - Transaction submission and acceptance
 * - Mining progress and inclusion in blocks
 * - Confirmation count and finality
 * - Error states and failure reasons
 *
 * @auth Required - User must be authenticated
 * @method GET - Uses SSE for streaming updates
 * @endpoint /transactions/track
 *
 * @input TransactionStatusInputSchema - Transaction identifier and operation type
 * @output Stream of TransactionStatusSchema events
 *
 * @example
 * ```typescript
 * // Client-side usage
 * const eventSource = new EventSource('/api/transactions/track?transactionId=0x123&operation=issue');
 * eventSource.onmessage = (event) => {
 *   const status = JSON.parse(event.data);
 *   console.log(`Transaction ${status.stage}: ${status.message}`);
 * };
 * ```
 */
const track = ac
  .route({
    method: "GET",
    path: "/transactions/track",
    description: "Track a transaction using server sent events",
    tags: ["transaction"],
  })
  .input(TransactionStatusInputSchema)
  .output(eventIterator(TransactionStatusSchema));

export const transactionContract = {
  track,
};
