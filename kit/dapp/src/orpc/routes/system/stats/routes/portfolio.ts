import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { createTimeSeries } from "@/lib/utils/timeseries";
import { systemRouter } from "@/orpc/procedures/system.router";
import { buildStatsRangeQuery } from "@atk/zod/stats-range";
import { timestamp } from "@atk/zod/timestamp";
import { z } from "zod";

/**
 * GraphQL query to fetch portfolio history and latest snapshot
 */
const PORTFOLIO_VALUE_QUERY = theGraphGraphql(`
  query PortfolioHistoryHourly(
    $accountIdString: String!
    $accountId: ID!
    $fromMicroseconds: Timestamp
    $toMicroseconds: Timestamp
    $interval: Aggregation_interval!
  ) {
    accountStats: accountStats_collection(
      interval: $interval
      where: {
        account: $accountIdString,
        timestamp_gte: $fromMicroseconds,
        timestamp_lte: $toMicroseconds
      }
      orderBy: timestamp
    ) {
      timestamp
      totalValueInBaseCurrency
    }
    baseline: accountStats_collection(
      interval: $interval
      where: {
        account: $accountIdString,
        timestamp_lte: $fromMicroseconds
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1
    ) {
      timestamp
      totalValueInBaseCurrency
    }
    current: accountStatsState(id: $accountId) {
      totalValueInBaseCurrency
    }
  }
`);

// Base schema for portfolio data items
const PortfolioHistoryItemSchema = z.object({
  timestamp: timestamp(),
  totalValueInBaseCurrency: z.string(),
});

const PortfolioResponseSchema = z.object({
  accountStats: z.array(PortfolioHistoryItemSchema),
  baseline: z.array(PortfolioHistoryItemSchema),
  current: z
    .object({
      totalValueInBaseCurrency: z.string(),
    })
    .nullable(),
});

/**
 * Portfolio route handler.
 *
 * Fetches the historical portfolio value for the authenticated user
 * within the current system over the specified time range and interval.
 *
 * The portfolio value represents the total value of all tokens held
 * by the user in the system, calculated in the base currency.
 *
 * Authentication: Required
 * Method: GET /system/stats/portfolio
 *
 * @param from - Start timestamp (ISO string, optional)
 * @param to - End timestamp (ISO string, optional)
 * @param interval - Aggregation interval: "hour" or "day" (default: "day")
 * @returns Promise<PortfolioMetrics> - Time-series portfolio data
 * @throws UNAUTHORIZED - If user is not authenticated
 * @throws INTERNAL_SERVER_ERROR - If TheGraph query fails
 *
 * @example
 * ```typescript
 * // Get daily portfolio data for the last 30 days
 * const { data } = await orpc.system.stats.portfolio.query({
 *   interval: "day",
 *   from: "2024-01-01T00:00:00Z",
 *   to: "2024-01-31T23:59:59Z"
 * });
 *
 * // Use data for charting
 * data.forEach(point => {
 *   console.log(`${point.timestamp}: ${point.totalValue}`);
 * });
 * ```
 */
export const statsPortfolio = systemRouter.system.stats.portfolio.handler(
  async ({ input, context }) => {
    // Get user's wallet address from auth context
    const userAddress = context.auth.user.wallet;

    const now = new Date();
    const { interval, fromMicroseconds, toMicroseconds, range } =
      buildStatsRangeQuery(input, {
        now,
        // TODO: replace minFrom with context.system.createdAt when available
      });

    // Build query variables
    const accountId = userAddress.toLowerCase();
    const variables = {
      accountId,
      accountIdString: accountId,
      fromMicroseconds,
      toMicroseconds,
      interval,
    } as const;

    const portfolioData = await context.theGraphClient.query(
      PORTFOLIO_VALUE_QUERY,
      {
        input: variables,
        output: PortfolioResponseSchema,
      }
    );

    const results = [
      ...portfolioData.baseline,
      ...portfolioData.accountStats,
      {
        timestamp: range.to,
        totalValueInBaseCurrency:
          portfolioData.current?.totalValueInBaseCurrency ?? "0",
      },
    ];

    const series = createTimeSeries(results, ["totalValueInBaseCurrency"], {
      range,
      aggregation: "last",
      accumulation: "max",
      historical: true,
    });

    return {
      range,
      data: series,
    };
  }
);
