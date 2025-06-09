import "server-only";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/sentry-tracing";
import { t, type StaticDecode } from "@/lib/utils/typebox";
import { safeParse } from "@/lib/utils/typebox/index";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

/**
 * GraphQL query to fetch sidebar asset data
 */
const SidebarAssets = theGraphGraphqlKit(
  `
  query SidebarAssets($limit: Int!) {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      id
      name
      symbol
    }
    bonds(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      id
      name
      symbol
    }
    equities(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      id
      name
      symbol
    }
    funds(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      id
      name
      symbol
    }
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      id
      name
      symbol
    }
    deposits(orderBy: totalSupplyExact, orderDirection: desc, first: $limit) {
      id
      name
      symbol
    }
    assetCounts {
      assetType
      count
    }
  }
`
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

const SidebarAssetSchema = t.Object(
  {
    id: t.EthereumAddress({
      description: "The contract address of the stablecoin token",
    }),
    name: t.String({
      description: "The full name of the stablecoin token",
    }),
    symbol: t.AssetSymbol({
      description: "The trading symbol or ticker of the stablecoin token",
    }),
  },
  {
    description: "Sidebar asset data",
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
      t.Array(SidebarAssetSchema),
      result.stableCoins || []
    );

    const validatedBonds = safeParse(
      t.Array(SidebarAssetSchema),
      result.bonds || []
    );

    const validatedEquities = safeParse(
      t.Array(SidebarAssetSchema),
      result.equities || []
    );

    const validatedFunds = safeParse(
      t.Array(SidebarAssetSchema),
      result.funds || []
    );

    const validatedCryptoCurrencies = safeParse(
      t.Array(SidebarAssetSchema),
      result.cryptoCurrencies || []
    );

    const validatedDeposits = safeParse(
      t.Array(SidebarAssetSchema),
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
