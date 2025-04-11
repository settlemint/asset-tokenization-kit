"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { sanitizeSearchTerm } from "@/lib/utils/string";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import type { VariablesOf } from "@settlemint/sdk-thegraph";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { isAddress } from "viem";
import { AssetUsersFragment } from "./asset-users-fragment";
import { AssetUsersSchema } from "./asset-users-schema";

/**
 * GraphQL query to search for assets by name, symbol, or address
 */
const AssetSearch = theGraphGraphqlKit(
  `
  query SearchAssets($searchAddress: Bytes, $search: String!) {
    assets(
      where: {
        or: [
          { name_contains_nocase: $search },
          { symbol_contains_nocase: $search },
          { id: $searchAddress }
        ]
      },
      first: 10
    ) {
      holders {
        id
        value
      }
      ...AssetUsersFragment
    }
  }
`,
  [AssetUsersFragment]
);

/**
 * GraphQL query to get all assets with a limit
 */
const AllAssets = theGraphGraphqlKit(
  `
  query AllAssets($limit: Int!) {
    assets(
      first: $limit,
      orderBy: name,
      orderDirection: asc
    ) {
      holders {
        id
        value
      }
      ...AssetUsersFragment
    }
  }
`,
  [AssetUsersFragment]
);

/**
 * Props interface for asset search components
 */
export interface AssetSearchProps {
  searchTerm: string;
}

/**
 * Searches for assets by address, name, or symbol
 *
 * @param params - Object containing the search term
 * @returns Array of validated assets matching the search term
 */
export const getAssetSearch = withTracing(
  "queries",
  "getAssetSearch",
  cache(async ({ searchTerm }: AssetSearchProps) => {
    "use cache";
    cacheTag("asset");
    const sanitizedSearchTerm = sanitizeSearchTerm(searchTerm);

    let assets;

    if (!sanitizedSearchTerm) {
      // If no search term, fetch all assets with a reasonable limit
      const result = await theGraphClientKit.request(
        AllAssets,
        { limit: 10 },
        {
          "X-GraphQL-Operation-Name": "AllAssets",
          "X-GraphQL-Operation-Type": "query",
          cache: "force-cache",
        }
      );
      assets = result.assets;
    } else {
      // Otherwise perform the search
      const search: VariablesOf<typeof AssetSearch> = {
        search: sanitizedSearchTerm,
      };

      if (isAddress(sanitizedSearchTerm)) {
        search.searchAddress = sanitizedSearchTerm;
      }

      const result = await theGraphClientKit.request(AssetSearch, search, {
        "X-GraphQL-Operation-Name": "AssetSearch",
        "X-GraphQL-Operation-Type": "query",
        cache: "force-cache",
      });
      assets = result.assets;
    }

    // Validate data using TypeBox schema
    const validatedAssets = assets.map((asset) => {
      // Add default empty auditors array for validation
      const assetWithDefaults = {
        ...asset,
        // The schema requires auditors, but they are only on certain asset types
        // Add an empty array as default for validation
        auditors: [],
      };
      return safeParse(AssetUsersSchema, assetWithDefaults);
    });
    return validatedAssets;
  })
);
