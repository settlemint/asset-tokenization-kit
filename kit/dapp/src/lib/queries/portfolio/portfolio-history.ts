import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { cache } from "react";
import { getAddress, type Address } from "viem";

/**
 * TypeBox schema for portfolio history data
 */
export const PortfolioHistorySchema = t.Object(
  {
    timestamp: t.String({
      description: "Timestamp of the data point",
    }),
    account: t.Object(
      {
        id: t.EthereumAddress({
          description: "Account address",
        }),
      },
      { description: "Account information" }
    ),
    asset: t.Object(
      {
        id: t.EthereumAddress({
          description: "Asset contract address",
        }),
        name: t.String({
          description: "Asset name",
        }),
        symbol: t.String({
          description: "Asset symbol",
        }),
        decimals: t.Number({
          description: "Asset decimals",
        }),
      },
      { description: "Asset information" }
    ),
    balance: t.BigDecimal({
      description: "Balance at this timestamp",
    }),
    balanceExact: t.BigInt({
      description: "Exact balance at this timestamp",
    }),
  },
  { description: "Historical portfolio data point" }
);

export type PortfolioHistory = StaticDecode<typeof PortfolioHistorySchema>;

const PortfolioHistoryQuery = theGraphGraphqlKit(
  `
  query PortfolioHistory($account: String!, $interval: Aggregation_interval!, $startTime: Timestamp!) {
    portfolioStats_collection(
      where: { account: $account, timestamp_gte: $startTime }
      interval: $interval
    ) {
      timestamp
      account {
        id
      }
      asset {
        id
        name
        symbol
        decimals
      }
      totalBalance
      totalBalanceExact
    }
  }
`
);

interface GetPortfolioHistoryParams {
  address: Address;
  days?: number;
  interval?: "hour" | "day";
}

/**
 * Fetches historical portfolio data for an account
 */
export const getPortfolioHistory = cache(
  async ({
    address,
    days = 30,
    interval = "day",
  }: GetPortfolioHistoryParams) => {
    // Calculate start time based on days parameter
    const startTime = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const data = await theGraphClientKit.request(PortfolioHistoryQuery, {
      account: getAddress(address),
      interval,
      startTime: startTime.toString(),
    });

    return data.portfolioStats_collection.map((stat: any) => ({
      timestamp: stat.timestamp,
      account: {
        id: stat.account.id,
      },
      asset: {
        id: stat.asset.id,
        name: stat.asset.name,
        symbol: stat.asset.symbol,
        decimals: stat.asset.decimals,
      },
      balance: stat.totalBalance,
      balanceExact: stat.totalBalanceExact,
    }));
  }
);
