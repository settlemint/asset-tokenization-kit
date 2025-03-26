import { fetchAllTheGraphPages } from "@/lib/pagination";
import { AssetBalanceFragment } from "@/lib/queries/asset-balance/asset-balance-fragment";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import BigNumber from "bignumber.js";
import { cache } from "react";
import { getAddress, type Address } from "viem";
import { getAssetPriceInUserCurrency } from "../asset-price/asset-price";
import { getAssetStats } from "../asset-stats/asset-stats";
import { AssetBalanceSchema, type AssetBalance } from "./asset-balance-schema";

const UserAssetsBalance = theGraphGraphqlKit(
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

export type UserAsset = AssetBalance;

type AssetType = AssetBalance["asset"]["type"];

export const getUserAssetsBalance = cache(async (wallet: Address) => {
  const userAssetsBalance = await fetchAllTheGraphPages(async (first, skip) => {
    const pageResult = await theGraphClientKit.request(UserAssetsBalance, {
      accountId: getAddress(wallet),
      first,
      skip,
    });
    return pageResult.account?.balances ?? [];
  });

  // Parse and validate the data using TypeBox schema
  const validatedUserAssetsBalance = (
    await Promise.all(
      userAssetsBalance.map(async (asset) => {
        try {
          const [price, stats] = await Promise.all([
            getAssetPriceInUserCurrency(asset.asset.id),
            getAssetStats({
              address: getAddress(asset.asset.id),
              days: 30,
            }),
          ]);
          return safeParse(AssetBalanceSchema, {
            ...asset,
            asset: {
              ...asset.asset,
              price,
              stats,
            },
          });
        } catch (error) {
          console.error("Error validating asset balance:", error);
          return null;
        }
      })
    )
  ).filter((balance): balance is AssetBalance => balance !== null);

  if (!validatedUserAssetsBalance.length) {
    return {
      balances: [],
      distribution: [],
      total: "0",
    };
  }
  // Group and sum balances by asset type
  const assetTypeBalances = validatedUserAssetsBalance.reduce<
    Partial<Record<AssetType, BigNumber>>
  >((acc, balance) => {
    const assetType = balance.asset.type;
    if (!acc[assetType]) {
      acc[assetType] = BigNumber(0);
    }
    acc[assetType] = acc[assetType].plus(BigNumber(balance.value.toString()));
    return acc;
  }, {});

  // Calculate total across all types
  const total = Object.values(assetTypeBalances).reduce(
    (acc, value) => acc.plus(value),
    BigNumber(0)
  );

  // Calculate distribution percentages by type
  const distribution = Object.entries(assetTypeBalances).map(
    ([type, value]) => ({
      asset: { type: type as AssetType },
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
});
