import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { z } from "zod";

/**
 * GraphQL query to fetch system-wide transaction metrics
 */
const SYSTEM_TRANSACTIONS_QUERY = theGraphGraphql(`
  query SystemTransactions($since: Timestamp!) {
    # Total transaction count (all Transfer events)
    totalTransactions: eventStats_collection(
      where: { eventName: "Transfer" }
      interval: day
    ) {
      eventsCount
    }

    # Recent transactions in the specified time range
    recentTransactions: eventStats_collection(
      where: {
        timestamp_gte: $since
        eventName: "Transfer"
      }
      interval: day
    ) {
      eventsCount
    }

    # Transaction history over time for charting
    transactionHistory: eventStats_collection(
      where: {
        timestamp_gte: $since
        eventName: "Transfer"
      }
      interval: day
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      eventsCount
    }
  }
`);

/**
 * GraphQL query to fetch transaction history for a specific token
 */
const ASSET_TRANSACTIONS_QUERY = theGraphGraphql(`
  query AssetTransactions($tokenId: ID!, $since: Timestamp!) {
    token(id: $tokenId) {
      id
      # Get transfer events for this specific token
      transferEvents: events(
        where: {
          eventName: "Transfer"
          timestamp_gte: $since
        }
        orderBy: timestamp
        orderDirection: asc
      ) {
        id
        timestamp
        eventName
        blockNumber
      }
    }

    # Also get aggregated stats by day for charting
    eventStats: eventStats_collection(
      where: {
        token: $tokenId
        eventName: "Transfer"
        timestamp_gte: $since
      }
      interval: day
      orderBy: timestamp
      orderDirection: asc
    ) {
      timestamp
      eventsCount
    }
  }
`);

// Schema for system transactions GraphQL response
const SystemTransactionsResponseSchema = z.object({
  totalTransactions: z.array(z.object({ eventsCount: z.number() })),
  recentTransactions: z.array(z.object({ eventsCount: z.number() })),
  transactionHistory: z.array(
    z.object({
      timestamp: z.string(),
      eventsCount: z.number(),
    })
  ),
});

// Schema for asset transactions GraphQL response
const AssetTransactionsResponseSchema = z.object({
  token: z
    .object({
      id: z.string(),
      transferEvents: z.array(
        z.object({
          id: z.string(),
          timestamp: z.string(),
          eventName: z.string(),
          blockNumber: z.string(),
        })
      ),
    })
    .nullable(),
  eventStats: z.array(
    z.object({
      timestamp: z.string(),
      eventsCount: z.number(),
    })
  ),
});

/**
 * Helper function to sum event counts from event stats
 */
function sumEventCounts(eventStats: { eventsCount: number }[]): number {
  return eventStats.reduce((total, stat) => total + stat.eventsCount, 0);
}

/**
 * System-wide transactions route handler.
 * GET /stats/transactions
 */
export const transactions = authRouter.token.statsTransactions
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .handler(async ({ context, input }) => {
    const timeRange = input.timeRange;

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - timeRange);
    const sinceTimestamp = Math.floor(since.getTime() / 1000);

    const response = await context.theGraphClient.query(
      SYSTEM_TRANSACTIONS_QUERY,
      {
        input: {
          since: sinceTimestamp.toString(),
        },
        output: SystemTransactionsResponseSchema,
        error: "Failed to fetch system transactions",
      }
    );

    // Calculate totals
    const totalTransactions = sumEventCounts(response.totalTransactions);
    const recentTransactions = sumEventCounts(response.recentTransactions);

    // Process the transaction history data
    const transactionHistory = response.transactionHistory.map((stat) => ({
      timestamp: stat.timestamp,
      transactions: stat.eventsCount,
    }));

    return {
      totalTransactions,
      recentTransactions,
      transactionHistory,
      timeRangeDays: timeRange,
    };
  });

/**
 * Asset-specific transactions route handler.
 * GET /stats/{address}/transactions
 */
export const assetTransactions = tokenRouter.token.statsAssetTransactions
  .use(theGraphMiddleware)
  .handler(async ({ context, input }) => {
    const tokenId = context.token.id.toLowerCase();
    const timeRange = input.timeRange;

    // Calculate the date range for queries
    const since = new Date();
    since.setDate(since.getDate() - timeRange);
    const sinceTimestamp = Math.floor(since.getTime() / 1000);

    // Fetch token-specific transaction history
    const response = await context.theGraphClient.query(
      ASSET_TRANSACTIONS_QUERY,
      {
        input: {
          tokenId,
          since: sinceTimestamp.toString(),
        },
        output: AssetTransactionsResponseSchema,
        error: "Failed to fetch asset transactions",
      }
    );

    // Process the data for chart consumption
    const transactionHistory = response.eventStats.map((stat) => ({
      timestamp: stat.timestamp,
      transactions: stat.eventsCount,
    }));

    return {
      tokenId,
      timeRangeDays: timeRange,
      transactionHistory,
      totalEvents: response.token?.transferEvents.length ?? 0,
    };
  });
