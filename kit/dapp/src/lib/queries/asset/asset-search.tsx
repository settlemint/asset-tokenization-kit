import { theGraphClientKits, theGraphGraphqlKits } from "@/lib/settlemint/the-graph";
import { sanitizeSearchTerm } from "@/lib/utils/string";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { isAddress } from "viem";
import { AssetFragment, AssetFragmentSchema } from "./asset-fragment";

/**
 * GraphQL query to search for assets by name, symbol, or address
 */
const AssetSearch = theGraphGraphqlKits(
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
      ...AssetFragment
    }
  }
`,
  [AssetFragment]
);

/**
 * Props interface for asset search components
 */
export interface AssetSearchProps {
  searchTerm: string;
}

interface AssetSearchResponse {
  assets: unknown[];
}

interface AssetSearchVariables {
  search: string;
  searchAddress?: string;
}

/**
 * Searches for assets by address, name, or symbol
 *
 * @param params - Object containing the search term
 * @returns Array of validated assets matching the search term
 */
export const getAssetSearch = cache(
  async ({ searchTerm }: AssetSearchProps) => {
    const sanitizedSearchTerm = sanitizeSearchTerm(searchTerm);

    if (!sanitizedSearchTerm) {
      return [];
    }

    const search: AssetSearchVariables = {
      search: sanitizedSearchTerm,
    };

    if (isAddress(sanitizedSearchTerm)) {
      search.searchAddress = sanitizedSearchTerm;
    }

    const { assets } = await theGraphClientKits.request<AssetSearchResponse>(
      AssetSearch,
      search
    );

    // Validate data using Zod schema
    const validatedAssets = assets.map((asset) =>
      safeParseWithLogging(AssetFragmentSchema, asset, "asset search")
    );

    return validatedAssets;
  }
);
