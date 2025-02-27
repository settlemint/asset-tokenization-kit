import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging, z, type ZodInfer } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
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
 * Cached function to fetch sidebar asset raw data
 */
const fetchSidebarAssetsData = unstable_cache(
  async () => {
    const result = await theGraphClientStarterkits.request(SidebarAssets);
    return result;
  },
  ['asset', 'sidebar'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
);

/**
 * Fetches sidebar assets data
 *
 * @param options - Query options including optional limit
 * @returns Formatted sidebar asset data with counts
 */
export async function getSidebarAssets(options?: SidebarAssetsOptions) {
  const result = await fetchSidebarAssetsData();
  const { limit = 10 } = options || {};

  // Validate stableCoins with Zod schema
  const validatedStableCoins = (result.stableCoins || []).map((coin) =>
    safeParseWithLogging(StableCoinFragmentSchema, coin, 'stablecoin')
  );

  const validatedBonds = (result.bonds || []).map((bond) =>
    safeParseWithLogging(BondFragmentSchema, bond, 'bond')
  );

  const validatedEquities = (result.equities || []).map((equity) =>
    safeParseWithLogging(EquityFragmentSchema, equity, 'equity')
  );

  const validatedFunds = (result.funds || []).map((fund) =>
    safeParseWithLogging(FundFragmentSchema, fund, 'fund')
  );

  const validatedCryptoCurrencies = (result.cryptoCurrencies || []).map(
    (currency) =>
      safeParseWithLogging(
        CryptoCurrencyFragmentSchema,
        currency,
        'cryptocurrency'
      )
  );

  // Validate assetCounts with Zod schema
  const validatedAssetCounts = (result.assetCounts || []).map((count) =>
    safeParseWithLogging(AssetCountSchema, count, 'assetCount')
  );

  // Limit the number of records if requested
  const limitedStableCoins = limit
    ? validatedStableCoins.slice(0, limit)
    : validatedStableCoins;

  const limitedBonds = limit ? validatedBonds.slice(0, limit) : validatedBonds;

  const limitedEquities = limit
    ? validatedEquities.slice(0, limit)
    : validatedEquities;

  const limitedFunds = limit ? validatedFunds.slice(0, limit) : validatedFunds;

  const limitedCryptoCurrencies = limit
    ? validatedCryptoCurrencies.slice(0, limit)
    : validatedCryptoCurrencies;

  /**
   * Helper function to get the count for a specific asset type
   */
  const getCount = (
    assetType: 'bond' | 'cryptocurrency' | 'equity' | 'fund' | 'stablecoin'
  ) =>
    validatedAssetCounts.find((asset) => asset.assetType === assetType)
      ?.count ?? 0;

  return {
    stablecoin: {
      records: limitedStableCoins,
      count: getCount('stablecoin'),
    },
    equity: {
      records: limitedEquities,
      count: getCount('equity'),
    },
    bond: {
      records: limitedBonds,
      count: getCount('bond'),
    },
    fund: {
      records: limitedFunds,
      count: getCount('fund'),
    },
    cryptocurrency: {
      records: limitedCryptoCurrencies,
      count: getCount('cryptocurrency'),
    },
  };
}
