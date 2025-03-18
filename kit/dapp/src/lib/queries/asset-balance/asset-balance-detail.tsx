import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { formatNumber } from "@/lib/utils/number";
import { safeParseWithLogging } from "@/lib/utils/zod";
import { cache } from "react";
import { type Address, getAddress } from "viem";
import {
  AssetBalanceFragment,
  AssetBalanceFragmentSchema,
} from "./asset-balance-fragment";

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
    if (!account) {
      return undefined;
    }

    const normalizedAddress = getAddress(address);
    const normalizedAccount = getAddress(account);

    const result = await theGraphClientKit.request(AssetBalanceDetail, {
      address: normalizedAddress,
      account: normalizedAccount,
    });

    // Return undefined if no balance found
    if (result.assetBalances.length === 0) {
      return undefined;
    }

    // Parse and validate the balance data
    const validatedBalance = safeParseWithLogging(
      AssetBalanceFragmentSchema,
      result.assetBalances[0],
      "asset balance"
    );

    // Format BigDecimal values
    return {
      ...validatedBalance,
      value: formatNumber(validatedBalance.value),
      frozen: formatNumber(validatedBalance.frozen),
      available: validatedBalance.value - validatedBalance.frozen,
    };
  }
);
