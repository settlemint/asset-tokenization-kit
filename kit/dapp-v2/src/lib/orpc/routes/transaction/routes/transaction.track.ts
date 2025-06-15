import { portalMiddleware } from "@/lib/orpc/middlewares/services/portal.middleware";
import { portalGraphql } from "@/lib/settlemint/portal";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { ResultOf } from "@settlemint/sdk-thegraph";
import { setTimeout } from "node:timers/promises";
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

const MAX_ATTEMPTS = 30;
const DELAY_MS = 2000;
const POLLING_INTERVAL_MS = 500;
const TIMEOUT_MS = 180_000;

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
        await setTimeout(DELAY_MS);
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

    while (Date.now() - startTime <= TIMEOUT_MS) {
      const { _meta } = await theGraphClient.request(GET_INDEXING_STATUS_QUERY);
      const indexedBlock = _meta?.block.number ?? 0;

      if (indexedBlock >= Number(receipt.blockNumber)) {
        yield {
          status: "confirmed",
          message: messages.indexing.success,
          transactionHash,
        };
        return;
      }

      await setTimeout(POLLING_INTERVAL_MS);
    }

    yield {
      status: "failed",
      reason: messages.indexing.timeout,
      transactionHash,
    };
    return;
  });
