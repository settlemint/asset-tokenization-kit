import { PortfolioStatsDataFragment } from "@/lib/queries/portfolio/portfolio-fragment";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
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
export const getPortfolioStats = cache(
  async ({ address, days = 30 }: GetPortfolioHistoryParams) => {
    const startTime = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const data = await theGraphClientKit.request(PortfolioHistoryQuery, {
      account: getAddress(address),
      startTime: startTime.toString(),
    });

    return safeParse(PortfolioStatsCollectionSchema, data.portfolioStatsDatas);
  }
);
