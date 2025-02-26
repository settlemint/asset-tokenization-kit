import type { assetConfig } from '@/lib/config/assets';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  StableCoinFragment,
  StableCoinFragmentSchema,
} from '../stablecoin/stablecoin-fragment';

/**
 * GraphQL query to fetch sidebar asset data
 */
const SidebarAssets = theGraphGraphqlStarterkits(
  `
  query SidebarAssets {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...StableCoinFragment
    }
    assetCounts {
      assetType
      count
    }
  }
`,
  [StableCoinFragment]
);

/**
 * Zod schema for asset count entries
 */
const AssetCountSchema = z.object({
  assetType: z.string(),
  count: z.number(),
});

/**
 * Type for asset count entries
 */
export type AssetCount = ZodInfer<typeof AssetCountSchema>;

/**
 * Options interface for sidebar assets queries
 */
export interface SidebarAssetsOptions {
  /** Optional limit for number of assets per type */
  limit?: number;
}

/**
 * Interface for the response from the sidebar assets query
 */
export interface SidebarAssetsResponse {
  /** List of stablecoin assets */
  stableCoins: ZodInfer<typeof StableCoinFragmentSchema>[];
  /** Counts of different asset types */
  assetCounts: AssetCount[];
}

/**
 * Fetches and processes sidebar asset data
 *
 * @param options - Query options including optional limit
 * @returns Processed sidebar asset data validated with Zod
 */
async function getSidebarAssets({
  limit = 10,
}: SidebarAssetsOptions = {}): Promise<SidebarAssetsResponse> {
  try {
    const result = await theGraphClientStarterkits.request(SidebarAssets);

    // Validate stableCoins with Zod schema
    const validatedStableCoins = (result.stableCoins || []).map((coin) =>
      StableCoinFragmentSchema.parse(coin)
    );

    // Validate assetCounts with Zod schema
    const validatedAssetCounts = (result.assetCounts || []).map((count) =>
      AssetCountSchema.parse(count)
    );

    // Limit the number of records if requested
    const limitedStableCoins = limit
      ? validatedStableCoins.slice(0, limit)
      : validatedStableCoins;

    return {
      stableCoins: limitedStableCoins,
      assetCounts: validatedAssetCounts,
    };
  } catch (error) {
    console.error('Error fetching sidebar assets:', error);
    // Return empty results if there's an error
    return {
      stableCoins: [],
      assetCounts: [],
    };
  }
}

/**
 * Generates a consistent query key for sidebar assets queries
 *
 * @param options - Query options including optional limit
 * @returns Array representing the query key for React Query
 */
export const getQueryKey = (options?: SidebarAssetsOptions) =>
  ['asset', 'sidebar', options?.limit] as const;

/**
 * React Query hook for fetching sidebar assets
 *
 * @param options - Query options including optional limit
 * @returns Formatted sidebar asset data with counts
 */
export function useSidebarAssets(options?: SidebarAssetsOptions) {
  const queryKey = getQueryKey(options);

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getSidebarAssets(options),
  });

  /**
   * Helper function to get the count for a specific asset type
   */
  const getCount = (assetType: keyof typeof assetConfig) =>
    result.data.assetCounts.find((asset) => asset.assetType === assetType)
      ?.count ?? 0;

  return {
    stablecoin: {
      records: result.data.stableCoins,
      count: getCount('stablecoin'),
    },
    // Commented out sections for future asset types
    // equity: {
    //   records: result.data.equities,
    //   count: getCount("equity"),
    // },
    // bond: {
    //   records: result.data.bonds,
    //   count: getCount("bond"),
    // },
    // fund: {
    //   records: result.data.funds,
    //   count: getCount("fund"),
    // },
    // cryptocurrency: {
    //   records: result.data.cryptoCurrencies,
    //   count: getCount("cryptocurrency"),
    // },
  };
}
