import { portalMiddleware } from "@/lib/orpc/middlewares/services/portal.middleware";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { EthereumHash } from "@/lib/utils/zod/validators/ethereum-hash";
import { ORPCError } from "@orpc/server";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { ar } from "../../../procedures/auth.router";

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

const MAX_ATTEMPTS = 30;
const DELAY_MS = 2000;

export const track = ar.transaction.track
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { transactionHash, messages } = input;

    let receipt:
      | NonNullable<
          NonNullable<
            ResultOf<typeof GET_TRANSACTION_QUERY>["getTransaction"]
          >["receipt"]
        >
      | undefined = undefined;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const { getTransaction } = await context.portalClient.request(
        GET_TRANSACTION_QUERY,
        {
          transactionHash,
        }
      );

      receipt = getTransaction?.receipt ?? undefined;
      if (!receipt) {
        yield {
          status: "pending",
          message: messages.transaction.pending,
          transactionHash,
        };
        await delay(DELAY_MS);
        continue;
      }

      if (receipt.status !== "Success") {
        yield {
          status: "failed",
          reason: receipt.revertReasonDecoded ?? "",
          transactionHash,
        };
        break;
      }
    }

    if (!receipt) {
      yield {
        status: "failed",
        reason: messages.transaction.dropped,
        transactionHash,
      };
      return;
    }

    yield {
      status: "pending",
      message: messages.indexing.pending,
      transactionHash,
    };

    const startTime = Date.now();
    const timeoutMs = 180_000;
    const pollingIntervalMs = 500;

    while (true) {
      if (Date.now() - startTime > timeoutMs) {
        yield {
          status: "failed",
          reason: messages.indexing.timeout,
          transactionHash,
        };
        return;
      }

      const { _meta } = await theGraphClient.request(GET_INDEXING_STATUS_QUERY);
      const indexedBlock = _meta?.block?.number ?? 0;

      if (indexedBlock >= Number(receipt.blockNumber)) {
        yield {
          status: "confirmed",
          message: messages.indexing.success,
          transactionHash,
        };
      }

      await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
    }
  });

// Create logger instance with configurable log level
const logger = createLogger({
  level: process.env.SETTLEMINT_LOG_LEVEL as LogLevel,
});

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
 * Waits for transactions to be mined and indexed by The Graph
 * @param transactionHashes Array of transaction hashes to monitor
 * @returns Promise that resolves to true when all transactions are indexed
 * @throws ORPCError TRANSACTION_FAILED if any transaction fails
 * @throws ORPCError TIMEOUT if indexing times out
 * @throws ORPCError CONFIRMATION_TIMEOUT if transaction confirmation times out
 */
async function isIndexed(transactionHashes: EthereumHash[]) {
  const receipts = await waitForTransactions(transactionHashes);
  const lastBlockNumber = Math.max(
    ...receipts.map((r) => Number(r.blockNumber))
  );
  await waitForIndexingBlock(lastBlockNumber);
  return true;
}

/**
 * Waits for The Graph to index up to a specific block number
 * @param blockNumber The block number to wait for
 * @param timeoutMs Maximum time to wait in milliseconds (default: 3 minutes)
 * @param pollingIntervalMs Interval between status checks in milliseconds (default: 500ms)
 * @returns The indexed block number when complete
 * @throws ORPCError TIMEOUT if indexing times out
 */
async function waitForIndexingBlock(
  blockNumber: number,
  timeoutMs = 180_000,
  pollingIntervalMs = 500
) {
  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > timeoutMs) {
      throw new ORPCError("TIMEOUT", {
        message: `Indexing timeout after ${timeoutMs / 1000}s`,
        data: { details: { blockNumber, timeoutMs } },
      });
    }

    const { _meta } = await theGraphClient.request(GET_INDEXING_STATUS_QUERY);
    const indexedBlock = _meta?.block?.number ?? 0;

    if (indexedBlock >= blockNumber) return indexedBlock;

    await new Promise((resolve) => setTimeout(resolve, pollingIntervalMs));
  }
}

/**
 * Waits for multiple transactions to be mined and returns their receipts
 * @param hashes Array of transaction hashes to wait for
 * @returns Array of transaction receipts
 */
async function waitForTransactions(hashes: string[] | undefined) {
  if (!hashes?.length) return [];

  return Promise.all(hashes.map((hash) => waitForTransaction(hash)));
}

/**
 * Waits for a single transaction to be mined and returns its receipt
 * @param hash Transaction hash to monitor
 * @param maxAttempts Maximum number of attempts (default: 30)
 * @param delayMs Delay between attempts in milliseconds (default: 2s)
 * @returns Transaction receipt when successful
 * @throws ORPCError TRANSACTION_FAILED if transaction fails
 * @throws ORPCError CONFIRMATION_TIMEOUT if confirmation times out
 */
async function waitForTransaction(
  hash: string,
  maxAttempts = 30,
  delayMs = 2000
) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const { getTransaction } = await portalClient.request(
        GET_TRANSACTION_QUERY,
        { transactionHash: hash }
      );

      const receipt = getTransaction?.receipt;
      if (!receipt) {
        logger.debug(`Waiting for ${hash} (${attempt + 1}/${maxAttempts})`);
        await delay(delayMs);
        continue;
      }

      if (receipt.status === "Success") return receipt;

      throw new ORPCError("TRANSACTION_FAILED", {
        message: `Transaction ${hash} failed: ${
          receipt.revertReasonDecoded || receipt.revertReason || "Unknown"
        }`,
        data: { details: { hash, receipt } },
      });
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        if (error instanceof ORPCError) throw error;

        throw new ORPCError("CONFIRMATION_TIMEOUT", {
          message: `Transaction ${hash} confirmation timeout`,
          data: { details: { hash } },
          cause: error,
        });
      }
      await delay(delayMs);
    }
  }

  throw new ORPCError("CONFIRMATION_TIMEOUT", {
    message: `Transaction ${hash} confirmation timeout`,
    data: { details: { hash, maxAttempts } },
  });
}

/**
 * Creates a promise that resolves after a specified delay
 * @param ms Delay in milliseconds
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
