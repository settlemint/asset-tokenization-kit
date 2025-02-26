import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { z, type ZodInfer } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BondFragment, BondFragmentSchema } from '../bond/bond-fragment';
import {
  CryptoCurrencyFragment,
  CryptoCurrencyFragmentSchema,
} from '../cryptocurrency/cryptocurrency-fragment';
import {
  EquityFragment,
  EquityFragmentSchema,
} from '../equity/equity-fragment';
import { FundFragment, FundFragmentSchema } from '../fund/fund-fragment';
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
    bonds(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...BondFragment
    }
    equities(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...EquityFragment
    }
    funds(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...FundFragment
    }
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...CryptoCurrencyFragment
    }
    assetCounts {
      assetType
      count
    }
  }
`,
  [
    StableCoinFragment,
    BondFragment,
    EquityFragment,
    FundFragment,
    CryptoCurrencyFragment,
  ]
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
 * Fetches and processes sidebar asset data
 *
 * @param options - Query options including optional limit
 * @returns Processed sidebar asset data validated with Zod
 */
async function getSidebarAssets({ limit = 10 }: SidebarAssetsOptions = {}) {
  try {
    const result = await theGraphClientStarterkits.request(SidebarAssets);

    // Validate stableCoins with Zod schema
    const validatedStableCoins = (result.stableCoins || []).map((coin) =>
      StableCoinFragmentSchema.parse(coin)
    );

    const validatedBonds = (result.bonds || []).map((bond) =>
      BondFragmentSchema.parse(bond)
    );

    const validatedEquities = (result.equities || []).map((equity) =>
      EquityFragmentSchema.parse(equity)
    );

    const validatedFunds = (result.funds || []).map((fund) =>
      FundFragmentSchema.parse(fund)
    );

    const validatedCryptoCurrencies = (result.cryptoCurrencies || []).map(
      (currency) => CryptoCurrencyFragmentSchema.parse(currency)
    );

    // Validate assetCounts with Zod schema
    const validatedAssetCounts = (result.assetCounts || []).map((count) =>
      AssetCountSchema.parse(count)
    );

    // Limit the number of records if requested
    const limitedStableCoins = limit
      ? validatedStableCoins.slice(0, limit)
      : validatedStableCoins;

    const limitedBonds = limit
      ? validatedBonds.slice(0, limit)
      : validatedBonds;

    const limitedEquities = limit
      ? validatedEquities.slice(0, limit)
      : validatedEquities;

    const limitedFunds = limit
      ? validatedFunds.slice(0, limit)
      : validatedFunds;

    const limitedCryptoCurrencies = limit
      ? validatedCryptoCurrencies.slice(0, limit)
      : validatedCryptoCurrencies;

    return {
      stableCoins: limitedStableCoins,
      assetCounts: validatedAssetCounts,
      bonds: limitedBonds,
      equities: limitedEquities,
      funds: limitedFunds,
      cryptoCurrencies: limitedCryptoCurrencies,
    };
  } catch (error) {
    console.error('Error fetching sidebar assets:', error);
    // Return empty results if there's an error
    return {
      stableCoins: [],
      assetCounts: [],
      bonds: [],
      equities: [],
      funds: [],
      cryptoCurrencies: [],
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
  const getCount = (
    assetType: 'bond' | 'cryptocurrency' | 'equity' | 'fund' | 'stablecoin'
  ) =>
    result.data.assetCounts.find((asset) => asset.assetType === assetType)
      ?.count ?? 0;

  return {
    stablecoin: {
      records: result.data.stableCoins,
      count: getCount('stablecoin'),
    },
    equity: {
      records: result.data.equities,
      count: getCount('equity'),
    },
    bond: {
      records: result.data.bonds,
      count: getCount('bond'),
    },
    fund: {
      records: result.data.funds,
      count: getCount('fund'),
    },
    cryptocurrency: {
      records: result.data.cryptoCurrencies,
      count: getCount('cryptocurrency'),
    },
  };
}
