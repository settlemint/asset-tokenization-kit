import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import {
  AssetActivityFragment,
  AssetActivityFragmentSchema,
} from "./asset-activity-fragment";

/**
 * GraphQL query to fetch asset activity data
 */
const AssetActivity = theGraphGraphqlStarterkits(
  `
  query AssetActivity($first: Int, $skip: Int) {
    assetActivityDatas(first: $first, skip: $skip) {
      ...AssetActivityFragment
    }
  }
`,
  [AssetActivityFragment]
);

/**
 * Options interface for asset activity queries
 */
export interface AssetActivityOptions {
  /** Optional limit to restrict total items fetched */
  limit?: number;
}

/**
 * Fetches and processes asset activity data
 *
 * @param options - Query options including optional limit
 * @returns Array of validated asset activity data
 */
export const getAssetActivity = cache(
  async ({ limit }: AssetActivityOptions = {}) => {
    const rawData = await fetchAllTheGraphPages(async (first, skip) => {
      const response = await theGraphClientStarterkits.request(AssetActivity, {
        first,
        skip,
      });

      const activityData = response.assetActivityDatas || [];

      // If we have a limit, check if we should stop
      if (limit && skip + activityData.length >= limit) {
        return activityData.slice(0, limit - skip);
      }

      return activityData;
    }, limit);

    // Validate data using Zod schema
    const validatedData = rawData.map((data) =>
      safeParseWithLogging(AssetActivityFragmentSchema, data, "asset activity")
    );

    return validatedData;
  }
);
