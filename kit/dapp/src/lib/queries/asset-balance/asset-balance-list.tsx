"use server"; // because this needs to be fetched client side in the address hover

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse, t } from "@/lib/utils/typebox";
import { cache } from "react";
import type { Address } from "viem";
import { AssetBalanceFragment } from "./asset-balance-fragment";
import { AssetBalanceSchema } from "./asset-balance-schema";

/**
 * GraphQL query to fetch asset balances
 */
const AssetBalanceList = theGraphGraphqlKit(
  `
  query Balances($address: String, $wallet: String) {
    assetBalances(where: {asset: $address, valueExact_gt: "0"}) {
      ...AssetBalanceFragment
    }
    userBalances: assetBalances(where: {account: $wallet, valueExact_gt: "0"}) {
      ...AssetBalanceFragment
    }
  }
`,
  [AssetBalanceFragment]
);

/**
 * Props interface for asset balance list components
 */
export interface AssetBalanceListProps {
  /** Optional asset address to filter by */
  address?: Address;
  /** Optional wallet address to filter by */
  wallet?: Address;
  /** Optional limit to restrict total items fetched */
  limit?: number;
}

/**
 * Fetches and processes asset balance data
 *
 * @param params - Object containing optional filters and limits
 * @returns Array of validated asset balances
 */
export const getAssetBalanceList = cache(
  async ({ address, wallet }: AssetBalanceListProps) => {
    const result = await theGraphClientKit.request(AssetBalanceList, {
      address: address,
      wallet: wallet,
    });

    const balances = safeParse(
      t.Array(AssetBalanceSchema),
      result.assetBalances || []
    );
    const userBalances = safeParse(
      t.Array(AssetBalanceSchema),
      result.userBalances || []
    );

    if (wallet) {
      return userBalances;
    }

    return balances;
  }
);
