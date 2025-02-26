import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type Address, getAddress } from 'viem';
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
 * Fetches and processes asset balance data
 *
 * @param params - Object containing optional filters and limits
 * @returns Array of validated asset balances
 */
export async function getAssetBalanceList({
  address,
  wallet,
}: AssetBalanceListProps) {
  try {
    const result = await theGraphClientStarterkits.request(AssetBalanceList, {
      address: address,
      wallet: wallet,
    });

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
  } catch (error) {
    console.error('Error fetching asset balances:', error);
    return [];
  }
}

/**
 * Generates a consistent query key for asset balance list queries
 *
 * @param params - Object containing optional filters and limits
 * @returns Array representing the query key for React Query
 */
const getQueryKey = ({ address, wallet, limit }: AssetBalanceListProps) =>
  [
    'asset',
    'balance',
    address ? getAddress(address) : 'all',
    wallet ? getAddress(wallet) : 'all',
    limit,
  ] as const;

/**
 * React Query hook for fetching asset balance lists
 *
 * @param params - Object containing optional filters and limits
 * @returns Query result with asset balances and query key
 */
export function useAssetBalanceList({
  address,
  wallet,
  limit,
}: AssetBalanceListProps) {
  const queryKey = getQueryKey({ address, wallet, limit });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getAssetBalanceList({ address, wallet, limit }),
  });

  return {
    ...result,
    queryKey,
  };
}
