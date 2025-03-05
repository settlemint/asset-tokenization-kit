"use server"; // because this needs to be fetched client side in the address hover

import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from "@/lib/settlemint/the-graph";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import type { Address } from "viem";
import {
  AssetBalanceFragment,
  AssetBalanceFragmentSchema,
} from "./asset-balance-fragment";

/**
 * GraphQL query to fetch asset balances
 */
const AssetBalanceList = theGraphGraphqlStarterkits(
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
    const result = await theGraphClientStarterkits.request(AssetBalanceList, {
      address: address,
      wallet: wallet,
    });

    const balances = result.assetBalances || [];
    const userBalances = result.userBalances || [];

    // Validate data using Zod schema
    const validatedBalances = balances.map((balance) => {
      const validatedBalance = safeParseWithLogging(
        AssetBalanceFragmentSchema,
        balance,
        "balance"
      );
      return {
        ...validatedBalance,
      };
    });

    const validatedUserBalances = userBalances.map((balance) => {
      const validatedBalance = safeParseWithLogging(
        AssetBalanceFragmentSchema,
        balance,
        "user balance"
      );
      return {
        ...validatedBalance,
      };
    });

    if (wallet) {
      return validatedUserBalances;
    }

    return validatedBalances;
  }
);
