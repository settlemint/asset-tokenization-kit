import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import { systemRouter } from "@/orpc/procedures/system.router";
import { getUnixTime } from "date-fns";
import { z } from "zod";

/**
 * GraphQL query to fetch hourly portfolio data
 */
const PORTFOLIO_HOURLY_QUERY = theGraphGraphql(`
  query PortfolioHistoryHourly($accountId: String!, $from: Timestamp, $to: Timestamp) {
    accountStats: accountStats_collection(
      interval: hour
      where: {
        account: $accountId,
        timestamp_gte: $from,
        timestamp_lte: $to
      }
      orderBy: timestamp
    ) {
      timestamp
      totalValueInBaseCurrency
    }
  }
`);

/**
 * GraphQL query to fetch daily portfolio data
 */
const PORTFOLIO_DAILY_QUERY = theGraphGraphql(`
  query PortfolioHistoryDaily($accountId: String!, $from: Timestamp, $to: Timestamp) {
    accountStats: accountStats_collection(
      interval: day
      where: {
        account: $accountId,
        timestamp_gte: $from,
        timestamp_lte: $to
      }
      orderBy: timestamp
    ) {
      timestamp
      totalValueInBaseCurrency
    }
  }
`);

// Base schema for portfolio data items
const PortfolioDataItem = z.object({
  timestamp: z.string(),
  totalValueInBaseCurrency: z.string(),
});

const PortfolioResponseSchema = z.object({
  accountStats: z.array(PortfolioDataItem),
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

    // Build query variables
    const variables: {
      accountId: string;
      from?: string;
      to?: string;
    } = {
      accountId: userAddress.toLowerCase(),
    };

    if (input.from) {
      variables.from = getUnixTime(input.from).toString();
    }

    if (input.to) {
      variables.to = getUnixTime(input.to).toString();
    }

    const query =
      input.interval === "hour"
        ? PORTFOLIO_HOURLY_QUERY
        : PORTFOLIO_DAILY_QUERY;
    const portfolioData = await context.theGraphClient.query(query, {
      input: variables,
      output: PortfolioResponseSchema,
    });

    return {
      data: portfolioData.accountStats,
    };
  }
);
