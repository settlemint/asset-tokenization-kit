import "server-only";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
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
export const getAssetBalanceDetail = withTracing(
  "queries",
  "getAssetBalanceDetail",
  cache(async ({ address, account }: AssetBalanceDetailProps) => {
    "use cache";
    cacheTag("asset");

    if (!account) {
      return undefined;
    }

    try {
      const normalizedAddress = getAddress(address);
      const normalizedAccount = getAddress(account);

      const result = await theGraphClientKit.request(
        AssetBalanceDetail,
        {
          address: normalizedAddress,
          account: normalizedAccount,
        },
        {
          "X-GraphQL-Operation-Name": "AssetBalanceDetail",
          "X-GraphQL-Operation-Type": "query",
          cache: "force-cache",
        }
      );

      if (result.assetBalances.length === 0) {
        return undefined;
      }

      const validatedBalance = safeParse(
        AssetBalanceSchema,
        result.assetBalances[0]
      );

      const formattedBalance = {
        ...validatedBalance,
        available: validatedBalance.value - validatedBalance.frozen,
      };

      return formattedBalance;
    } catch (error) {
      // Keep error logging for actual errors
      console.error(
        "ASSET BALANCE QUERY - Error fetching asset balance:",
        error
      );
      return undefined;
    }
  })
);
