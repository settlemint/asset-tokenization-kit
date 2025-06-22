/**
 * @fileoverview Transaction tracking helper utilities for monitoring blockchain transactions.
 *
 * This module provides functionality to track Ethereum transactions through their complete lifecycle:
 * 1. **Mining Phase**: Monitors transaction inclusion in a block
 * 2. **Indexing Phase**: Waits for TheGraph to index the transaction data
 *
 * The tracking system uses server-sent events to provide real-time status updates
 * to clients, enabling responsive UIs that accurately reflect transaction states.
 *
 * @deprecated This direct tracking approach is deprecated in favor of the centralized
 * tracking system implemented in the portal middleware. New code should use the
 * middleware's tracking capabilities instead of calling this function directly.
 *
 * @module orpc/helpers/transactions
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import {
  ethereumHash,
  type EthereumHash,
} from "@/lib/zod/validators/ethereum-hash";
import type { ValidatedPortalClient } from "@/orpc/middlewares/services/portal.middleware";
import type { ValidatedTheGraphClient } from "@/orpc/middlewares/services/the-graph.middleware";
import {
  TransactionTrackingMessagesSchema,
  type TransactionTrackingMessages,
} from "@/orpc/routes/common/schemas/transaction-messages.schema";
import { withEventMeta } from "@orpc/server";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { setTimeout } from "node:timers/promises";
import { z } from "zod/v4";

/**
 * Schema for transaction tracking output events.
 *
 * Defines the structure of events emitted during transaction tracking:
 * - transactionHash: The Ethereum transaction hash being tracked
 * - message: Human-readable status message
 * - status: Current tracking status (pending, confirmed, or failed)
 */
export const TransactionTrackOutputSchema = z.object({
  transactionHash: ethereumHash,
  message: z.string(),
  status: z.enum(["pending", "confirmed", "failed"]),
});

/**
 * Schema for GetTransaction query response from the Portal GraphQL API.
 *
 * Validates the structure of transaction receipt data returned from blockchain queries:
 * - `status`: Transaction execution status ("Success" or "Reverted")
 * - `revertReasonDecoded`: Human-readable revert reason if transaction failed
 * - `revertReason`: Raw revert reason bytes if decoding failed
 * - `blockNumber`: Block number where transaction was included
 *
 * The entire receipt may be optional if transaction is still pending.
 */
const GetTransactionResponseSchema = z.object({
  getTransaction: z
    .object({
      receipt: z
        .object({
          status: z.enum(["Success", "Reverted"]),
          revertReasonDecoded: z.string().nullable(),
          revertReason: z.string().nullable(),
          blockNumber: z.string(),
        })
        .optional(),
    })
    .nullable(),
});

/**
 * Schema for GetIndexingStatus query response from TheGraph.
 *
 * Validates the indexing metadata structure:
 * - `_meta.block.number`: The latest block number that has been indexed
 *
 * This is used to determine when transaction data becomes queryable after confirmation.
 */
const GetIndexingStatusResponseSchema = z.object({
  _meta: z
    .object({
      block: z.object({
        number: z.number(),
      }),
    })
    .nullable(),
});

/**
 * GraphQL query to fetch transaction receipt from the blockchain.
 *
 * Retrieves transaction status and block information needed to verify
 * transaction completion and track indexing progress.
 */
const GET_TRANSACTION_QUERY = portalGraphql(`
  query GetTransaction($transactionHash: String!) {
    getTransaction(transactionHash: $transactionHash) {
      receipt {
        status
        revertReasonDecoded
        revertReason
        blockNumber
      }
    }
  }
`);

/**
 * GraphQL query to check TheGraph indexing status.
 *
 * Returns the latest block number that has been indexed, allowing us
 * to determine when transaction data is available for querying.
 */
const GET_INDEXING_STATUS_QUERY = theGraphGraphql(
  `
  query GetIndexingStatus {
    _meta {
      block {
        number
      }
    }
  }
`
);

/**
 * Configuration constants for transaction tracking polling behavior.
 *
 * These values control the timing and retry logic for both phases of tracking:
 * - Mining phase: Uses MAX_ATTEMPTS and DELAY_MS for receipt polling
 * - Indexing phase: Uses POLLING_INTERVAL_MS and INDEXING_TIMEOUT_MS
 * - Overall stream: Limited by STREAM_TIMEOUT_MS to prevent indefinite connections
 */
const MAX_ATTEMPTS = 30; // Maximum attempts to fetch transaction receipt
const DELAY_MS = 2000; // Delay between transaction receipt checks (2 seconds)
const POLLING_INTERVAL_MS = 500; // Interval for indexing status checks (500ms)
const INDEXING_TIMEOUT_MS = 60_000; // Total timeout for indexing phase (60 seconds)
const STREAM_TIMEOUT_MS = 90_000; // Total timeout for the entire stream (90 seconds)

/**
 * Track a blockchain transaction through confirmation and indexing phases.
 *
 * @deprecated This function is deprecated. Transaction tracking is now handled automatically
 * by the portal middleware. New code should rely on the middleware's centralized tracking
 * system instead of calling this function directly.
 *
 * This generator function monitors a transaction through two distinct phases:
 *
 * 1. **Mining Phase**: Polls the blockchain for transaction receipt
 *    - Checks if transaction was included in a block
 *    - Verifies transaction success or failure status
 *    - Extracts revert reasons if transaction failed
 *
 * 2. **Indexing Phase**: Waits for TheGraph to index the transaction
 *    - Ensures transaction data is queryable via GraphQL
 *    - Required before UI can display transaction results
 *
 * The function yields status events as the transaction progresses, enabling
 * real-time UI updates via server-sent events (SSE).
 *
 * @param transactionHash - The Ethereum transaction hash to track (0x-prefixed hex string)
 * @param portalClient - Validated Portal GraphQL client for blockchain queries
 * @param theGraphClient - Validated TheGraph client for checking indexing status
 * @param customMessages - Optional custom status messages to override defaults
 *
 * @returns AsyncIterator yielding transaction tracking events with the following structure:
 * - `transactionHash`: The transaction being tracked
 * - `status`: Current status ("pending" | "confirmed" | "failed")
 * - `message`: Human-readable status message
 *
 * @example
 * ```typescript
 * // Track a transaction with custom messages
 * const events = trackTransaction(
 *   "0x123...",
 *   portalClient,
 *   theGraphClient,
 *   {
 *     waitingForMining: "Processing your token transfer...",
 *     transactionIndexed: "Token transfer complete!"
 *   }
 * );
 *
 * // Consume events in an SSE endpoint
 * for await (const event of events) {
 *   yield event; // Send to client via SSE
 * }
 * ```
 *
 * @throws Never throws directly - all errors are converted to "failed" status events
 */
export async function* trackTransaction(
  transactionHash: EthereumHash,
  portalClient: ValidatedPortalClient,
  theGraphClient: ValidatedTheGraphClient,
  customMessages?: Partial<TransactionTrackingMessages>
) {
  // Parse and validate custom messages, filling in defaults for any missing values
  const messages = TransactionTrackingMessagesSchema.parse(
    customMessages ?? {}
  );
  const streamStartTime = Date.now();

  // ========================================================================
  // PHASE 1: TRANSACTION MINING
  // Monitor blockchain for transaction confirmation
  // ========================================================================

  /**
   * Type representing the transaction receipt returned by the Portal GraphQL API.
   * Contains transaction status, revert reasons, and block information.
   */
  let receipt:
    | NonNullable<
        NonNullable<
          ResultOf<typeof GET_TRANSACTION_QUERY>["getTransaction"]
        >["receipt"]
      >
    | undefined = undefined;

  // Poll for transaction receipt with fixed interval retry strategy
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Check if overall stream timeout has been exceeded
    if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "failed",
          message: messages.streamTimeout,
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      return; // Exit early on stream timeout
    }
    // Query blockchain for transaction receipt
    const result = await portalClient.query(
      GET_TRANSACTION_QUERY,
      {
        transactionHash,
      },
      GetTransactionResponseSchema,
      messages.waitingForMining
    );

    receipt = result.getTransaction?.receipt ?? undefined;

    // Transaction not yet mined, emit pending status and continue polling
    if (!receipt) {
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "pending",
          message: messages.waitingForMining,
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      await setTimeout(DELAY_MS);
      continue;
    }

    // Check if transaction was reverted or failed
    if (receipt.status !== "Success") {
      // Emit failure with revert reason if available
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "failed",
          message:
            receipt.revertReasonDecoded ?? // Prefer human-readable reason
            receipt.revertReason ?? // Fallback to raw revert bytes
            messages.transactionFailed, // Default failure message
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      return;
    }

    // Transaction successfully mined, proceed to indexing phase
    break;
  }

  // Handle case where transaction was not found after all retry attempts
  if (!receipt) {
    yield withEventMeta(
      TransactionTrackOutputSchema.parse({
        status: "failed",
        message: messages.transactionDropped,
        transactionHash,
      }),
      { id: transactionHash, retry: 1000 }
    );
    return;
  }

  // ========================================================================
  // PHASE 2: THEGRAPH INDEXING
  // Wait for transaction data to be indexed and queryable
  // ========================================================================

  // Notify client that mining is complete and indexing has begun
  yield withEventMeta(
    TransactionTrackOutputSchema.parse({
      status: "pending",
      message: messages.waitingForIndexing,
      transactionHash,
    }),
    { id: transactionHash, retry: 1000 }
  );

  const indexingStartTime = Date.now();

  // Poll TheGraph indexing status until transaction block is indexed
  while (Date.now() - indexingStartTime <= INDEXING_TIMEOUT_MS) {
    // Check for overall stream timeout
    if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "failed",
          message: messages.streamTimeout,
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      return; // Exit on stream timeout
    }

    // Query TheGraph for current indexing progress
    const result = await theGraphClient.query(
      GET_INDEXING_STATUS_QUERY,
      {},
      GetIndexingStatusResponseSchema,
      messages.waitingForIndexing
    );
    const indexedBlock = result._meta?.block.number ?? 0;

    // Check if TheGraph has caught up to the transaction's block
    if (indexedBlock >= Number(receipt.blockNumber)) {
      // Transaction is now fully indexed and queryable
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "confirmed",
          message: messages.transactionIndexed,
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      return; // Success - tracking complete
    }

    // Wait before next indexing check
    await setTimeout(POLLING_INTERVAL_MS);
  }

  // Indexing phase exceeded timeout limit
  // Transaction is confirmed on-chain but data not yet available in TheGraph
  yield withEventMeta(
    TransactionTrackOutputSchema.parse({
      status: "failed",
      message: messages.indexingTimeout,
      transactionHash,
    }),
    { id: transactionHash, retry: 1000 }
  );
  return;
}
