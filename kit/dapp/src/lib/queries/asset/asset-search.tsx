import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { useQuery } from '@tanstack/react-query';
import { type Address, getAddress } from 'viem';
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
  /** Ethereum address to search for */
  address: Address;
}

/**
 * Searches for assets by address, name, or symbol
 *
 * @param params - Object containing the search address
 * @returns Array of matching assets, validated with Zod
 */
async function getAssetSearch({ address }: AssetSearchProps) {
  if (!address) {
    return [];
  }

  try {
    const result = await theGraphClientStarterkits.request(AssetSearch, {
      searchAddress: address,
      search: address,
    });

    // Parse and validate each asset in the results using Zod schema
    const validatedAssets = (result.assets || []).map((asset) =>
      AssetFragmentSchema.parse(asset)
    );

    return validatedAssets;
  } catch (error) {
    console.error('Error searching for assets:', error);
    return [];
  }
}

/**
 * Generates a consistent query key for asset search queries
 *
 * @param params - Object containing the search address
 * @returns Array representing the query key for React Query
 */
const getQueryKey = ({ address }: AssetSearchProps) =>
  ['asset', 'search', address ? getAddress(address) : 'none'] as const;

/**
 * React Query hook for searching assets
 *
 * @param params - Object containing the search address
 * @returns Query result with matching assets and query key
 */
export function useAssetSearch({ address }: AssetSearchProps) {
  const queryKey = getQueryKey({ address });

  const result = useQuery({
    queryKey,
    queryFn: () => getAssetSearch({ address }),
    enabled: !!address,
  });

  return {
    ...result,
    queryKey,
  };
}
