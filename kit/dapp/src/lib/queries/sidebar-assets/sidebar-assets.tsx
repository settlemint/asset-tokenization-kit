import {
    theGraphClientKits,
    theGraphGraphqlKits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging, z, type ZodInfer } from "@/lib/utils/zod";
import { cache } from "react";
import { BondFragment, BondFragmentSchema } from "../bond/bond-fragment";
import {
    CryptoCurrencyFragment,
    CryptoCurrencyFragmentSchema,
} from "../cryptocurrency/cryptocurrency-fragment";
import {
    EquityFragment,
    EquityFragmentSchema,
} from "../equity/equity-fragment";
import { FundFragment, FundFragmentSchema } from "../fund/fund-fragment";
import {
    StableCoinFragment,
    StableCoinFragmentSchema,
} from "../stablecoin/stablecoin-fragment";

/**
 * GraphQL query to fetch sidebar asset data
 */
const SidebarAssets = theGraphGraphqlKits(
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

interface SidebarAssetsResponse {
  stableCoins: unknown[];
  bonds: unknown[];
  equities: unknown[];
  funds: unknown[];
  cryptoCurrencies: unknown[];
  assetCounts: unknown[];
}

/**
 * Fetches sidebar assets data
 *
 * @param options - Query options including optional limit
 * @returns Formatted sidebar asset data with counts
 */
export const getSidebarAssets = cache(
  async (options?: SidebarAssetsOptions) => {
    const result = await theGraphClientKits.request<SidebarAssetsResponse>(SidebarAssets);
    const { limit = 10 } = options || {};

    // Validate stableCoins with Zod schema
    const validatedStableCoins = (result.stableCoins || []).map((coin: unknown) =>
      safeParseWithLogging(StableCoinFragmentSchema, coin, "stablecoin")
    );

    // Validate bonds with Zod schema
    const validatedBonds = (result.bonds || []).map((bond: unknown) =>
      safeParseWithLogging(BondFragmentSchema, bond, "bond")
    );

    // Validate equities with Zod schema
    const validatedEquities = (result.equities || []).map((equity: unknown) =>
      safeParseWithLogging(EquityFragmentSchema, equity, "equity")
    );

    // Validate funds with Zod schema
    const validatedFunds = (result.funds || []).map((fund: unknown) =>
      safeParseWithLogging(FundFragmentSchema, fund, "fund")
    );

    // Validate cryptocurrencies with Zod schema
    const validatedCryptoCurrencies = (result.cryptoCurrencies || []).map(
      (currency: unknown) =>
        safeParseWithLogging(
          CryptoCurrencyFragmentSchema,
          currency,
          "cryptocurrency"
        )
    );

    // Validate asset counts with Zod schema
    const validatedAssetCounts = (result.assetCounts || []).map((count: unknown) =>
      safeParseWithLogging(AssetCountSchema, count, "asset count")
    );

    // Create a map of asset counts by type
    const assetCountsByType = validatedAssetCounts.reduce<Record<string, number>>(
      (acc, count) => {
        acc[count.assetType] = count.count;
        return acc;
      },
      {}
    );

    // Create a map of assets by type
    const assetsByType = {
      stablecoin: validatedStableCoins,
      bond: validatedBonds,
      equity: validatedEquities,
      fund: validatedFunds,
      cryptocurrency: validatedCryptoCurrencies,
    };

    // Create a map of assets by type with counts
    const assetsByTypeWithCounts = Object.entries(assetsByType).reduce<
      Record<string, { records: unknown[]; count: number }>
    >((acc, [type, assets]) => {
      acc[type] = {
        records: assets.slice(0, limit),
        count: assetCountsByType[type] || 0,
      };
      return acc;
    }, {});

    return assetsByTypeWithCounts;
  }
);
