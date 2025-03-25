import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse, t } from "@/lib/utils/typebox";
import { getUnixTime, startOfDay, subDays } from "date-fns";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { AssetStatsFragment } from "./asset-stats-fragment";
import { AssetStatsSchema } from "./asset-stats-schema";

/**
 * GraphQL query to fetch asset statistics from The Graph
 *
 * @remarks
 * Retrieves hourly statistics for an asset within a specified time range
 */
const AssetStats = theGraphGraphqlKit(
  `
query AssetStats($asset: String!, $timestamp_gte: Timestamp!, $first: Int, $skip: Int) {
  assetStats_collection(
    interval: hour
    where: {asset: $asset, timestamp_gte: $timestamp_gte}
    first: $first
    skip: $skip
  ) {
    ...AssetStatsFragment
  }
}
`,
  [AssetStatsFragment]
);

/**
 * Props interface for asset stats components
 *
 */
export interface AssetStatsProps {
  /** Ethereum address of the asset contract */
  address: Address;
  /** Number of days to look back (default: 1) */
  days?: number;
}

/**
 * Fetches and processes asset statistics data from The Graph
 *
 * @param params - Object containing the asset address and time range
 *
 * @remarks
 * This function calculates the start date based on the days parameter,
 * fetches data from The Graph, validates it using the AssetStatsSchema,
 * and returns validated asset statistics.
 */
export const getAssetStats = cache(
  async ({ address, days = 1 }: AssetStatsProps) => {
    const normalizedAddress = getAddress(address);
    // Calculate timestamp for start date
    const startDate = subDays(new Date(), days - 1);
    const timestampGte = getUnixTime(startOfDay(startDate)).toString();

    const result = await fetchAllTheGraphPages(async (first, skip) => {
      const response = await theGraphClientKit.request(AssetStats, {
        asset: normalizedAddress,
        timestamp_gte: timestampGte,
        first,
        skip,
      });

      return response.assetStats_collection || [];
    });

    return safeParse(t.Array(AssetStatsSchema), result);
  }
);
