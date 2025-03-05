import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  AssetBalanceFragment,
  AssetBalanceFragmentSchema,
} from "@/lib/queries/asset-balance/asset-balance-fragment";
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import BigNumber from "bignumber.js";
import { cache } from "react";
import { type Address, getAddress } from "viem";

const MyAssets = theGraphGraphqlStarterkits(
  `
  query MyAssets($accountId: ID!, $first: Int, $skip: Int) {
    account(id: $accountId) {
      balances(first: $first, skip: $skip) {
        ...AssetBalanceFragment
      }
    }
  }
`,
  [AssetBalanceFragment]
);

const PAUSABLE_ASSET_TYPES = new Set([
  "StableCoin",
  "Bond",
  "Fund",
  "Equity",
  "CryptoCurrency",
] as const);

type PausableAssetType =
  typeof PAUSABLE_ASSET_TYPES extends Set<infer T> ? T : never;

export type MyAsset = Awaited<
  ReturnType<typeof getPortfolioDashboardData>
>["balances"][number];

export const getPortfolioDashboardData = cache(
  async (wallet: Address, active = true) => {
    const myAssets = await fetchAllTheGraphPages(async (first, skip) => {
      const pageResult = await theGraphClientStarterkits.request(MyAssets, {
        accountId: getAddress(wallet),
        first,
        skip,
      });
      return pageResult.account?.balances ?? [];
    });

    // Parse and validate the data using Zod schemas
    let validatedMyAssets = myAssets.map((asset) =>
      safeParseWithLogging(AssetBalanceFragmentSchema, asset, "balance")
    );

    if (!validatedMyAssets.length) {
      return {
        balances: [],
        distribution: [],
        total: "0",
      };
    }

    if (active) {
      validatedMyAssets = validatedMyAssets.filter((balance) => {
        const asset = balance.asset;
        if (PAUSABLE_ASSET_TYPES.has(asset.type as PausableAssetType)) {
          return true;
        }
        return !asset.paused;
      });
    }

    // Group and sum balances by asset type
    const assetTypeBalances = validatedMyAssets.reduce<
      Record<PausableAssetType, BigNumber>
    >(
      (acc, balance) => {
        const assetType = balance.asset.type as PausableAssetType;
        if (!acc[assetType]) {
          acc[assetType] = BigNumber(0);
        }
        acc[assetType] = acc[assetType].plus(
          BigNumber(balance.value.toString())
        );
        return acc;
      },
      {} as Record<PausableAssetType, BigNumber>
    );

    // Calculate total across all types
    const total = Object.values(assetTypeBalances).reduce(
      (acc, value) => acc.plus(value),
      BigNumber(0)
    );

    // Calculate distribution percentages by type
    const distribution = Object.entries(assetTypeBalances).map(
      ([type, value]) => ({
        asset: { type: type as PausableAssetType },
        value: value.toString(),
        percentage: total.gt(0)
          ? Number.parseFloat(value.div(total).multipliedBy(100).toFixed(2))
          : 0,
      })
    );

    return {
      balances: validatedMyAssets,
      distribution,
      total: total.toString(),
    };
  }
);
