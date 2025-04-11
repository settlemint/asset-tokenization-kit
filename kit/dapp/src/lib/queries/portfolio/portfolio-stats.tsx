import { PortfolioStatsDataFragment } from "@/lib/queries/portfolio/portfolio-fragment";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { getAddress, type Address } from "viem";
import { PortfolioStatsCollectionSchema } from "./portfolio-schema";

const PortfolioHistoryQuery = theGraphGraphqlKit(
  `
  query PortfolioHistory($account: String!, $startTime: Timestamp!) {
    portfolioStatsDatas(
      where: { account: $account, timestamp_gte: $startTime }
    ) {
      ...PortfolioStatsDataFragment
    }
  }
`,
  [PortfolioStatsDataFragment]
);

interface GetPortfolioHistoryParams {
  address: Address;
  days?: number;
  interval?: "hour" | "day";
}

/**
 * Fetches historical portfolio data for an account
 *
 * @returns Promise resolving to an array of validated portfolio history data points
 * @throws Error if data validation fails
 */
export const getPortfolioStats = withTracing(
  "queries",
  "getPortfolioStats",
  cache(async ({ address, days = 30 }: GetPortfolioHistoryParams) => {
    "use cache";
    cacheTag("asset");
    const startTime = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const data = await theGraphClientKit.request(
      PortfolioHistoryQuery,
      {
        account: getAddress(address),
        startTime: startTime.toString(),
      },
      {
        "X-GraphQL-Operation-Name": "PortfolioHistory",
        "X-GraphQL-Operation-Type": "query",
        cache: "force-cache",
      }
    );

    return safeParse(PortfolioStatsCollectionSchema, data.portfolioStatsDatas);
  })
);
