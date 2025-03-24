import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { t } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { type ZodInfer, safeParseWithLogging, z } from "@/lib/utils/zod";
import { cache } from "react";
import { BondFragment } from "../bond/bond-fragment";
import { OnChainBondSchema } from "../bond/bond-schema";
import { CryptoCurrencyFragment } from "../cryptocurrency/cryptocurrency-fragment";
import { OnChainCryptoCurrencySchema } from "../cryptocurrency/cryptocurrency-schema";
import { EquityFragment } from "../equity/equity-fragment";
import { OnChainEquitySchema } from "../equity/equity-schema";
import { FundFragment } from "../fund/fund-fragment";
import { OnChainFundSchema } from "../fund/fund-schema";
import { StableCoinFragment } from "../stablecoin/stablecoin-fragment";
import { OnChainStableCoinSchema } from "../stablecoin/stablecoin-schema";
import { TokenizedDepositFragment } from "../tokenizeddeposit/tokenizeddeposit-fragment";
import { OnChainTokenizedDepositSchema } from "../tokenizeddeposit/tokenizeddeposit-schema";

/**
 * GraphQL query to fetch sidebar asset data
 */
const SidebarAssets = theGraphGraphqlKit(
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
    tokenizedDeposits(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...TokenizedDepositFragment
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
    TokenizedDepositFragment,
  ]
);

/**
 * Zod schema for asset count entries
 */
const AssetCountSchema = z.object({
  assetType: z.assetType(),
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
 * Fetches sidebar assets data
 *
 * @param options - Query options including optional limit
 * @returns Formatted sidebar asset data with counts
 */
export const getSidebarAssets = cache(
  async (options?: SidebarAssetsOptions) => {
    const result = await theGraphClientKit.request(SidebarAssets);
    const { limit = 10 } = options || {};

    const validatedStableCoins = safeParse(
      t.Array(OnChainStableCoinSchema),
      result.stableCoins || []
    );

    const validatedBonds = safeParse(
      t.Array(OnChainBondSchema),
      result.bonds || []
    );

    const validatedEquities = safeParse(
      t.Array(OnChainEquitySchema),
      result.equities || []
    );

    const validatedFunds = safeParse(
      t.Array(OnChainFundSchema),
      result.funds || []
    );

    const validatedCryptoCurrencies = safeParse(
      t.Array(OnChainCryptoCurrencySchema),
      result.cryptoCurrencies || []
    );

    const validatedTokenizedDeposits = safeParse(
      t.Array(OnChainTokenizedDepositSchema),
      result.tokenizedDeposits || []
    );

    // Validate assetCounts with Zod schema
    const validatedAssetCounts = (result.assetCounts || []).map((count) =>
      safeParseWithLogging(AssetCountSchema, count, "assetCount")
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

    const limitedTokenizedDeposits = limit
      ? validatedTokenizedDeposits.slice(0, limit)
      : validatedTokenizedDeposits;

    /**
     * Helper function to get the count for a specific asset type
     */
    const getCount = (
      assetType:
        | "bond"
        | "cryptocurrency"
        | "equity"
        | "fund"
        | "stablecoin"
        | "tokenizeddeposit"
    ) =>
      validatedAssetCounts.find((asset) => asset.assetType === assetType)
        ?.count ?? 0;

    return {
      stablecoin: {
        records: limitedStableCoins,
        count: getCount("stablecoin"),
      },
      equity: {
        records: limitedEquities,
        count: getCount("equity"),
      },
      bond: {
        records: limitedBonds,
        count: getCount("bond"),
      },
      fund: {
        records: limitedFunds,
        count: getCount("fund"),
      },
      cryptocurrency: {
        records: limitedCryptoCurrencies,
        count: getCount("cryptocurrency"),
      },
      tokenizeddeposit: {
        records: limitedTokenizedDeposits,
        count: getCount("tokenizeddeposit"),
      },
    };
  }
);
