import "server-only";

import { fetchAllTheGraphPages } from "@/lib/pagination";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { safeParse, t } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { AssetActivitySchema } from "./asset-activity-schema";

// /**
//  * GraphQL query to fetch asset activity data
//  */
// const AssetActivity = theGraphGraphqlKit(
//   `
//   query AssetActivity($first: Int, $skip: Int, $where: AssetActivityData_filter) {
//     assetActivityDatas(first: $first, skip: $skip, where: $where) {
//       ...AssetActivityFragment
//     }
//   }
// `,
//   [AssetActivityFragment]
// );

/**
 * Options interface for asset activity queries
 */
export interface AssetActivityOptions {
  /** Optional limit to restrict total items fetched */
  limit?: number;
  /** Optional asset address to filter activity */
  assetAddress?: string;
}

/**
 * Fetches and processes asset activity data
 *
 * @param options - Query options including optional limit and asset address filter
 * @returns Array of validated asset activity data
 */
export const getAssetActivity = withTracing(
  "queries",
  "getAssetActivity",
  cache(async ({ limit, assetAddress }: AssetActivityOptions = {}) => {
    "use cache";
    cacheTag("asset");
    const rawData = await fetchAllTheGraphPages(async (first, skip) => {
      // const response = await theGraphClientKit.request(
      //   AssetActivity,
      //   {
      //     first,
      //     skip,
      //     where: assetAddress ? { id: assetAddress } : undefined,
      //   },
      //   {
      //     "X-GraphQL-Operation-Name": "AssetActivity",
      //     "X-GraphQL-Operation-Type": "query",
      //   }
      // );

      // const activityData = response.assetActivityDatas || [];

      // If we have a limit, check if we should stop
      // if (limit && skip + activityData.length >= limit) {
      //   return activityData.slice(0, limit - skip);
      // }

      return [];
    }, limit);

    // Validate data using TypeBox schema
    try {
      return safeParse(t.Array(AssetActivitySchema), rawData);
    } catch (error) {
      console.error("Error validating asset activity data:", error);
      return [];
    }
  })
);
