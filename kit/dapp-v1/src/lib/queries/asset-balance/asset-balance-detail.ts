import "server-only";

import { withTracing } from "@/lib/utils/sentry-tracing";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import type { Address } from "viem";

/**
 * GraphQL query to fetch a specific asset balance
 */
// const AssetBalanceDetail = theGraphGraphqlKit(
//   `
//   query Balance($address: String!, $account: String!) {
//     assetBalances(where: {asset: $address, account: $account}) {
//       ...AssetBalanceFragment
//     }
//   }
// `,
//   [AssetBalanceFragment]
// );

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
      // const normalizedAddress = getAddress(address);
      // const normalizedAccount = getAddress(account);

      // const result = await theGraphClientKit.request(
      //   AssetBalanceDetail,
      //   {
      //     address: normalizedAddress,
      //     account: normalizedAccount,
      //   },
      //   {
      //     "X-GraphQL-Operation-Name": "AssetBalanceDetail",
      //     "X-GraphQL-Operation-Type": "query",
      //   }
      // );

      // NOTE: HARDCODED SO IT STILL COMPILES
      return { value: 0, blocked: false, available: 0 };
    } catch (error) {
      // Keep error logging for actual errors
      console.error(
        "ASSET BALANCE QUERY - Error fetching asset balance:",
        error
      );
      return { value: 0, blocked: false, available: 0 };
    }
  })
);
