"use server";

import { ROLES, type Role } from "@/lib/config/roles";
import { fetchAllTheGraphPages } from "@/lib/pagination";
import { AssetBalanceFragment } from "@/lib/queries/asset-balance/asset-balance-fragment";
import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import BigNumber from "bignumber.js";
import { cache } from "react";
import { getAddress, type Address } from "viem";
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

export type UserAsset = AssetBalance & { roles: Role[] };

type AssetType = AssetBalance["asset"]["type"];

export const getUserAssetsBalance = withTracing(
  "queries",
  "getUserAssetsBalance",
  cache(async (wallet: Address) => {
    const userAssetsBalance = await fetchAllTheGraphPages(
      async (first, skip) => {
        const pageResult = await theGraphClientKit.request(UserAssetsBalance, {
          accountId: getAddress(wallet),
          first,
          skip,
        });
        return pageResult.account?.balances ?? [];
      }
    );

    // Parse and validate the data using TypeBox schema
    const validatedUserAssetsBalance = userAssetsBalance
      .map((asset) => {
        try {
          return safeParse(AssetBalanceSchema, asset);
        } catch (error) {
          console.error("Error validating asset balance:", error);
          return null;
        }
      })
      .filter((balance): balance is AssetBalance => balance !== null);

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

    const balancesWithRoles = validatedUserAssetsBalance.map(
      (balance): UserAsset => ({
        ...balance,
        roles: getRoles(wallet, balance),
      })
    );

    return {
      balances: balancesWithRoles,
      distribution,
      total: total.toString(),
    };
  })
);

function getRoles(wallet: Address, balance: AssetBalance): Role[] {
  const roles: Role[] = [];
  const userWalletAddress = getAddress(wallet);
  const roleConfigs = [
    {
      permissions: balance.asset.admins,
      role: ROLES.DEFAULT_ADMIN_ROLE.contractRole,
    },
    {
      permissions: balance.asset.supplyManagers,
      role: ROLES.SUPPLY_MANAGEMENT_ROLE.contractRole,
    },
    {
      permissions: balance.asset.userManagers,
      role: ROLES.USER_MANAGEMENT_ROLE.contractRole,
    },
    {
      permissions: balance.asset.auditors,
      role: ROLES.AUDITOR_ROLE.contractRole,
    },
  ];

  for (const { permissions, role } of roleConfigs) {
    if (
      permissions?.some(
        (permission) => getAddress(permission.id) === userWalletAddress
      )
    ) {
      roles.push(role);
    }
  }
  return roles;
}
