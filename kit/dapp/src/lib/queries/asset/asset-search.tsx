import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { sanitizeSearchTerm } from '@/lib/utils/string';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { AssetFragment, AssetFragmentSchema } from './asset-fragment';

/**
 * GraphQL query to search for assets by name, symbol, or address
 */
const AssetSearch = theGraphGraphqlStarterkits(
  `
  query SearchAssets($searchAddress: Bytes!, $search: String!) {
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

/**
 * Cached function to fetch raw asset search data
 */
const fetchAssetSearchData = unstable_cache(
  async (searchTerm: string) => {
    if (!searchTerm) {
      return [];
    }

    const result = await theGraphClientStarterkits.request(AssetSearch, {
      searchAddress: searchTerm,
      search: searchTerm,
    });

    return result.assets || [];
  },
  ['asset', 'search'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
);

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

    const rawData = await fetchAssetSearchData(sanitizedSearchTerm);

    // Validate data using Zod schema
    const validatedAssets = rawData.map((asset) =>
      safeParseWithLogging(AssetFragmentSchema, asset, 'asset search')
    );

    return validatedAssets;
  }
);
