"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { BondFragment } from "../bond/bond-fragment";
import { OnChainBondSchema } from "../bond/bond-schema";
import { CryptoCurrencyFragment } from "../cryptocurrency/cryptocurrency-fragment";
import { OnChainCryptoCurrencySchema } from "../cryptocurrency/cryptocurrency-schema";
import { DepositFragment } from "../deposit/deposit-fragment";
import { OnChainDepositSchema } from "../deposit/deposit-schema";
import { EquityFragment } from "../equity/equity-fragment";
import { OnChainEquitySchema } from "../equity/equity-schema";
import { FundFragment } from "../fund/fund-fragment";
import { OnChainFundSchema } from "../fund/fund-schema";
import { StableCoinFragment } from "../stablecoin/stablecoin-fragment";
import { OnChainStableCoinSchema } from "../stablecoin/stablecoin-schema";

/**
 * GraphQL query to fetch sidebar asset data
 */
const SidebarAssets = theGraphGraphqlKit(
  `
  query SidebarAssets($limit: Int!) {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      ...StableCoinFragment
    }
    bonds(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      ...BondFragment
    }
    equities(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      ...EquityFragment
    }
    funds(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      ...FundFragment
    }
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      ...CryptoCurrencyFragment
    }
    deposits(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      ...DepositFragment
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
    DepositFragment,
  ]
);

/**
 * TypeBox schema for asset count entries
 */
const AssetCountSchema = t.Object(
  {
    assetType: t.AssetType({
      description: "The type of asset being counted",
    }),
    count: t.Number({
      description: "The total number of assets of this type",
    }),
  },
  {
    description: "Counter for the number of assets of a specific type",
  }
);

/**
 * Type for asset count entries
 */
export type AssetCount = StaticDecode<typeof AssetCountSchema>;

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
export const getSidebarAssets = withTracing(
  "queries",
  "getSidebarAssets",
  async (options?: SidebarAssetsOptions) => {
    "use cache";
    cacheTag("asset");
    const { limit = 10 } = options || {};
    const result = await theGraphClientKit.request(SidebarAssets, {
      limit,
    });

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

    const validatedDeposits = safeParse(
      t.Array(OnChainDepositSchema),
      result.deposits || []
    );

    // Validate assetCounts with TypeBox schema
    const validatedAssetCounts = safeParse(
      t.Array(AssetCountSchema),
      result.assetCounts || []
    );

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
        | "deposit"
    ) =>
      validatedAssetCounts.find((asset) => asset.assetType === assetType)
        ?.count ?? 0;

    return {
      stablecoin: {
        records: validatedStableCoins,
        count: getCount("stablecoin"),
      },
      equity: {
        records: validatedEquities,
        count: getCount("equity"),
      },
      bond: {
        records: validatedBonds,
        count: getCount("bond"),
      },
      fund: {
        records: validatedFunds,
        count: getCount("fund"),
      },
      cryptocurrency: {
        records: validatedCryptoCurrencies,
        count: getCount("cryptocurrency"),
      },
      deposit: {
        records: validatedDeposits,
        count: getCount("deposit"),
      },
    };
  }
);
