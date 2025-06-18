/**
 * Transaction Tracking Handler
 *
 * This handler implements real-time blockchain transaction tracking using Server-Sent Events.
 * It monitors transactions through two distinct phases:
 *
 * 1. **Transaction Confirmation**: Polls the blockchain via Portal GraphQL to check if
 *    the transaction has been mined and included in a block.
 *
 * 2. **Indexing Confirmation**: After blockchain confirmation, monitors TheGraph indexing
 *    service to ensure the transaction's effects are queryable in the subgraph.
 *
 * The two-phase approach ensures that clients can safely query indexed data immediately
 * after receiving the final confirmation, preventing race conditions where blockchain
 * data exists but hasn't been indexed yet.
 *
 * @see {@link ./transaction.track.schema} - Input/output schemas
 * @see {@link @/orpc/procedures/auth.router} - Authentication requirements
 */

import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { withEventMeta } from "@orpc/server";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { setTimeout } from "node:timers/promises";
import { authRouter } from "../../../procedures/auth.router";

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
 * Tracks blockchain transaction status and indexing progress.
 *
 * This generator function implements a two-phase tracking system that monitors
 * transactions from submission through to full indexing completion. It yields
 * status updates as Server-Sent Events, providing real-time feedback to clients.
 *
 * @auth Required - User must be authenticated
 * @middleware portalMiddleware - Provides Portal GraphQL client
 *
 * @param input.transactionHash - The transaction to track
 * @param input.messages - Customizable status messages for UX
 *
 * @yields Transaction status updates (pending, confirmed, or failed)
 *
 * @example
 * ```typescript
 * // Client-side consumption
 * const eventSource = new EventSource('/api/transactions/track?transactionHash=0x...');
 * eventSource.onmessage = (event) => {
 *   const status = JSON.parse(event.data);
 *   updateUI(status);
 * };
 * ```
 */
export const track = authRouter.transaction.track
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { transactionHash } = input;
    const streamStartTime = Date.now();

    // Phase 1: Monitor transaction confirmation on blockchain
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
          {
            status: "failed",
            reason: "Transaction tracking timed out after 90 seconds",
            transactionHash,
          },
          { id: transactionHash, retry: 1000 }
        );
        return; // Stream timeout
      }
      const { getTransaction } = await context.portalClient.request(
        GET_TRANSACTION_QUERY,
        {
          transactionHash,
        }
      );

      receipt = getTransaction?.receipt;

      // Transaction not yet mined, continue polling
      if (!receipt) {
        yield withEventMeta(
          {
            status: "pending",
            transactionHash,
          },
          { id: transactionHash, retry: 1000 }
        );
        await setTimeout(DELAY_MS);
        continue;
      }

      // Transaction failed or reverted
      if (receipt.status !== "Success") {
        yield withEventMeta(
          {
            status: "failed",
            reason:
              receipt.revertReasonDecoded ??
              receipt.revertReason ??
              "Transaction failed",
            transactionHash,
          },
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
        {
          status: "failed",
          reason: "Transaction was not confirmed on-chain in time.",
          transactionHash,
        },
        { id: transactionHash, retry: 1000 }
      );
      return;
    }

    // Phase 2: Monitor indexing progress
    yield withEventMeta(
      {
        status: "pending",
        transactionHash,
      },
      { id: transactionHash, retry: 1000 }
    );

    const indexingStartTime = Date.now();

    // Poll TheGraph until transaction block is indexed or timeout
    while (Date.now() - indexingStartTime <= INDEXING_TIMEOUT_MS) {
      if (Date.now() - streamStartTime > STREAM_TIMEOUT_MS) {
        yield withEventMeta(
          {
            status: "failed",
            reason: "Transaction tracking timed out after 90 seconds",
            transactionHash,
          },
          { id: transactionHash, retry: 1000 }
        );
        return; // Stream timeout
      }
      const { _meta } = await theGraphClient.request(GET_INDEXING_STATUS_QUERY);
      const indexedBlock = _meta?.block.number ?? 0;

      // Check if TheGraph has indexed up to or past the transaction block
      if (indexedBlock >= Number(receipt.blockNumber)) {
        yield withEventMeta(
          {
            status: "confirmed",
            transactionHash,
          },
          { id: transactionHash, retry: 1000 }
        );
        return;
      }

      await setTimeout(POLLING_INTERVAL_MS);
    }

    // Indexing timeout - transaction confirmed but not yet queryable
    yield withEventMeta(
      {
        status: "failed",
        reason: "Smart contract indexing timed out, please try again later",
        transactionHash,
      },
      { id: transactionHash, retry: 1000 }
    );
    return;
  });
