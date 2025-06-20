import type { portalClient as portalClientType } from "@/lib/settlemint/portal";
import { portalGraphql } from "@/lib/settlemint/portal";
import type { theGraphClient as theGraphClientType } from "@/lib/settlemint/the-graph";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import {
  ethereumHash,
  type EthereumHash,
} from "@/lib/zod/validators/ethereum-hash";
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

// Configuration constants for polling behavior
const MAX_ATTEMPTS = 30; // Maximum attempts to fetch transaction receipt
const DELAY_MS = 2000; // Delay between transaction receipt checks
const POLLING_INTERVAL_MS = 500; // Interval for indexing status checks
const INDEXING_TIMEOUT_MS = 60_000; // Total timeout for indexing (3 minutes)
const STREAM_TIMEOUT_MS = 90_000; // Total timeout for the stream (90 seconds)

/**
 * Track a blockchain transaction through confirmation and indexing phases.
 *
 * @param transactionHash - The transaction hash to track
 * @param portalClient - Portal GraphQL client for blockchain queries
 * @param theGraphClient - TheGraph client for indexing status
 * @param customMessages - Optional custom messages for status updates
 * @returns AsyncIterator of transaction status events
 */
export async function* trackTransaction(
  transactionHash: EthereumHash,
  portalClient: typeof portalClientType,
  theGraphClient: typeof theGraphClientType,
  customMessages?: Partial<TransactionTrackingMessages>
) {
  // Parse messages with defaults using Zod schema
  const messages = TransactionTrackingMessagesSchema.parse(
    customMessages ?? {}
  );
  const streamStartTime = Date.now();

  // Phase 1: Monitor transaction confirmation on blockchain
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

  // Poll for transaction receipt with exponential backoff
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "failed",
          message: messages.streamTimeout,
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      return; // Stream timeout
    }
    const { getTransaction } = await portalClient.request(
      GET_TRANSACTION_QUERY,
      {
        transactionHash,
      }
    );

    receipt = getTransaction?.receipt ?? undefined;

    // Transaction not yet mined, continue polling
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

    // Transaction failed or reverted
    if (receipt.status !== "Success") {
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "failed",
          message:
            receipt.revertReasonDecoded ??
            receipt.revertReason ??
            messages.transactionFailed,
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      return;
    }

    // Transaction successful, break to phase 2
    break;
  }

  // Transaction dropped from mempool or not found after max attempts
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

  // Phase 2: Monitor indexing progress
  yield withEventMeta(
    TransactionTrackOutputSchema.parse({
      status: "pending",
      message: messages.waitingForIndexing,
      transactionHash,
    }),
    { id: transactionHash, retry: 1000 }
  );

  const indexingStartTime = Date.now();

  // Poll TheGraph until transaction block is indexed or timeout
  while (Date.now() - indexingStartTime <= INDEXING_TIMEOUT_MS) {
    if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "failed",
          message: messages.streamTimeout,
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      return; // Stream timeout
    }
    const { _meta } = await theGraphClient.request(GET_INDEXING_STATUS_QUERY);
    const indexedBlock = _meta?.block.number ?? 0;

    // Check if TheGraph has indexed up to or past the transaction block
    if (indexedBlock >= Number(receipt.blockNumber)) {
      yield withEventMeta(
        TransactionTrackOutputSchema.parse({
          status: "confirmed",
          message: messages.transactionIndexed,
          transactionHash,
        }),
        { id: transactionHash, retry: 1000 }
      );
      return;
    }

    await setTimeout(POLLING_INTERVAL_MS);
  }

  // Indexing timeout - transaction confirmed but not yet queryable
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
