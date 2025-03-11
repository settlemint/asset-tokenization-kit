import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  AssetBalanceFragment,
  AssetBalanceFragmentSchema,
} from "@/lib/queries/asset-balance/asset-balance-fragment";
import { theGraphClient, theGraphGraphql } from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import BigNumber from "bignumber.js";
import { cache } from "react";
import { type Address, getAddress } from "viem";

const UserAssetsBalance = theGraphGraphql(
  `
  query UserAssetsBalance($accountId: ID!, $first: Int, $skip: Int) {
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
  "stablecoin",
  "bond",
  "fund",
  "equity",
] as const);

type PausableAssetType =
  typeof PAUSABLE_ASSET_TYPES extends Set<infer T> ? T : never;

export type UserAsset = Awaited<
  ReturnType<typeof geUserAssetsBalance>
>["balances"][number];

export const geUserAssetsBalance = cache(
  async (wallet: Address, active = true) => {
    const userAssetsBalance = await fetchAllTheGraphPages(
      async (first, skip) => {
        const pageResult = await theGraphClient.request(UserAssetsBalance, {
          accountId: getAddress(wallet),
          first,
          skip,
        });
        return pageResult.account?.balances ?? [];
      }
    );

    // Parse and validate the data using Zod schemas
    let validatedUserAssetsBalance = userAssetsBalance.map((asset) =>
      safeParseWithLogging(AssetBalanceFragmentSchema, asset, "balance")
    );

    if (!validatedUserAssetsBalance.length) {
      return {
        balances: [],
        distribution: [],
        total: "0",
      };
    }

    if (active) {
      validatedUserAssetsBalance = validatedUserAssetsBalance.filter(
        (balance) => {
          const asset = balance.asset;
          if (PAUSABLE_ASSET_TYPES.has(asset.type as PausableAssetType)) {
            return !asset.paused;
          }
          return true;
        }
      );
    }

    // Group and sum balances by asset type
    const assetTypeBalances = validatedUserAssetsBalance.reduce<
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
      balances: validatedUserAssetsBalance,
      distribution,
      total: total.toString(),
    };
  }
);
