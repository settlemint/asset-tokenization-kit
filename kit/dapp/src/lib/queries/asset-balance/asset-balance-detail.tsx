"use server";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { safeParse } from "@/lib/utils/typebox";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import { AssetBalanceFragment } from "./asset-balance-fragment";
import { AssetBalanceSchema } from "./asset-balance-schema";

/**
 * GraphQL query to fetch a specific asset balance
 */
const AssetBalanceDetail = theGraphGraphqlKit(
  `
  query Balance($address: String!, $account: String!) {
    assetBalances(where: {asset: $address, account: $account}) {
      ...AssetBalanceFragment
    }
  }
`,
  [AssetBalanceFragment]
);

/**
 * Props interface for asset balance detail components
 */
export interface AssetBalanceDetailProps {
  /** Ethereum address of the asset contract */
  address: Address;
  /** Optional account address to check balance for */
  account?: Address;
}

/**
 * Fetches and processes asset balance data for a specific address and account
 *
 * @param params - Object containing the asset address and account
 * @returns Asset balance data or undefined if not found
 */
export const getAssetBalanceDetail = cache(
  async ({ address, account }: AssetBalanceDetailProps) => {
    // Remove logs
    // console.log("ASSET BALANCE QUERY - Inputs:", { address, account });

    if (!account) {
      // console.log("ASSET BALANCE QUERY - No account provided, returning undefined");
      return undefined;
    }

    try {
      const normalizedAddress = getAddress(address);
      const normalizedAccount = getAddress(account);

      // console.log("ASSET BALANCE QUERY - Normalized addresses:", {
      //   normalizedAddress,
      //   normalizedAccount
      // });

      const result = await theGraphClientKit.request(AssetBalanceDetail, {
        address: normalizedAddress,
        account: normalizedAccount,
      });

      // console.log("ASSET BALANCE QUERY - Raw result:", result);

      if (result.assetBalances.length === 0) {
        // console.log("ASSET BALANCE QUERY - No balances found for this address/account");
        return undefined;
      }

      try {
        const validatedBalance = safeParse(
          AssetBalanceSchema,
          result.assetBalances[0]
        );

        const formattedBalance = {
          ...validatedBalance,
          available: validatedBalance.value - validatedBalance.frozen,
        };

        // console.log("ASSET BALANCE QUERY - Returning formatted balance:", formattedBalance);
        return formattedBalance;
      } catch (parseError) {
        // Keep error logging for actual errors
        console.error(
          "ASSET BALANCE QUERY - Error parsing balance data:",
          parseError
        );
        return undefined;
      }
    } catch (error) {
      // Keep error logging for actual errors
      console.error(
        "ASSET BALANCE QUERY - Error fetching asset balance:",
        error
      );
      return undefined;
    }
  }
);
