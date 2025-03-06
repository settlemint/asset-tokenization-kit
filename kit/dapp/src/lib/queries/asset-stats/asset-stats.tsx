import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientKits,
  theGraphGraphqlKits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { getUnixTime, startOfDay, subDays } from "date-fns";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import {
  AssetStatsFragment,
  AssetStatsFragmentSchema,
} from "./asset-stats-fragment";

/**
 * GraphQL query to fetch asset statistics from The Graph
 *
 * @remarks
 * Retrieves hourly statistics for an asset within a specified time range
 */
const AssetStats = theGraphGraphqlKits(
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

interface AssetStatsResponse {
  assetStats_collection: unknown[];
}

/**
 * Fetches and processes asset statistics data from The Graph
 *
 * @param params - Object containing the asset address and time range
 *
 * @remarks
 * This function calculates the start date based on the days parameter,
 * fetches data from The Graph, validates it using the AssetStatsFragmentSchema,
 * and processes the totalBurned field to be a negated string value.
 */
export const getAssetStats = cache(
  async ({ address, days = 1 }: AssetStatsProps) => {
    const normalizedAddress = getAddress(address);
    // Calculate timestamp for start date
    const startDate = subDays(new Date(), days - 1);
    const timestampGte = getUnixTime(startOfDay(startDate)).toString();

    const result = await fetchAllTheGraphPages(async (first, skip) => {
      const response = await theGraphClientKits.request<AssetStatsResponse>(AssetStats, {
        asset: normalizedAddress,
        timestamp_gte: timestampGte,
        first,
        skip,
      });

      return response.assetStats_collection || [];
    });

    // Validate data using Zod schema and process
    const validatedStats = result.map((item) => {
      const validatedItem = safeParseWithLogging(
        AssetStatsFragmentSchema,
        item,
        "asset stats"
      );

      return {
        ...validatedItem,
      };
    });

    return validatedStats;
  }
);
