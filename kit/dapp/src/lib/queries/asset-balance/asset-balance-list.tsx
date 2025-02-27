import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import type { Address } from 'viem';
import {
  AssetBalanceFragment,
  AssetBalanceFragmentSchema,
} from './asset-balance-fragment';

/**
 * GraphQL query to fetch asset balances
 */
const AssetBalanceList = theGraphGraphqlStarterkits(
  `
  query Balances($address: String, $wallet: String) {
    assetBalances(where: {asset: $address}) {
      ...AssetBalanceFragment
    }
    userBalances: assetBalances(where: {account: $wallet}) {
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
 * Cached function to fetch raw asset balance list data
 */
const fetchAssetBalanceListData = unstable_cache(
  async (address?: Address, wallet?: Address) => {
    const result = await theGraphClientStarterkits.request(AssetBalanceList, {
      address: address,
      wallet: wallet,
    });

    return result;
  },
  ['asset', 'balance', 'list'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
);

/**
 * Fetches and processes asset balance data
 *
 * @param params - Object containing optional filters and limits
 * @returns Array of validated asset balances
 */
export async function getAssetBalanceList({
  address,
  wallet,
}: AssetBalanceListProps) {
  const result = await fetchAssetBalanceListData(address, wallet);

  const balances = result.assetBalances || [];
  const userBalances = result.userBalances || [];

  // Validate data using Zod schema
  const validatedBalances = balances.map((balance) =>
    safeParseWithLogging(AssetBalanceFragmentSchema, balance, 'balance')
  );

  const validatedUserBalances = userBalances.map((balance) =>
    safeParseWithLogging(AssetBalanceFragmentSchema, balance, 'user balance')
  );

  if (wallet) {
    return validatedUserBalances;
  }

  return validatedBalances;
}
