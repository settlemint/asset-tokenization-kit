import { fetchAllTheGraphPages } from "@/lib/pagination";
import {
  type AssetBalance,
  AssetBalanceFragment,
  AssetBalanceFragmentSchema,
} from "@/lib/queries/asset-balance/asset-balance-fragment";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import BigNumber from "bignumber.js";
import { cache } from "react";
import { type Address, getAddress } from "viem";

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

export type UserAsset = Awaited<
  ReturnType<typeof getUserAssetsBalance>
>["balances"][number];

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

  // Parse and validate the data using Zod schemas
  const validatedUserAssetsBalance = userAssetsBalance.map((asset) =>
    safeParseWithLogging(AssetBalanceFragmentSchema, asset, "balance")
  );

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
