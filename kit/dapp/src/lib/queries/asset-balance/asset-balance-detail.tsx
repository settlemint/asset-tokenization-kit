import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type Address, getAddress } from 'viem';
import {
  AssetBalanceFragment,
  AssetBalanceFragmentSchema,
} from './asset-balance-fragment';

/**
 * GraphQL query to fetch a specific asset balance
 */
const AssetBalanceDetail = theGraphGraphqlStarterkits(
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
async function getAssetBalanceDetail({
  address,
  account,
}: AssetBalanceDetailProps) {
  if (!account) {
    return undefined;
  }

  try {
    const result = await theGraphClientStarterkits.request(AssetBalanceDetail, {
      address,
      account,
    });

    // Return undefined if no balance found
    if (result.assetBalances.length === 0) {
      return undefined;
    }

    // Parse and validate the balance data
    const validatedBalance = AssetBalanceFragmentSchema.parse(
      result.assetBalances[0]
    );

    return validatedBalance;
  } catch (error) {
    console.error(
      `Error fetching balance for asset ${address} and account ${account}:`,
      error
    );
    return undefined;
  }
}

/**
 * Generates a consistent query key for asset balance detail queries
 *
 * @param params - Object containing the asset address and account
 * @returns Array representing the query key for React Query
 */
const getQueryKey = ({ address, account }: AssetBalanceDetailProps) =>
  [
    'asset',
    'balance',
    getAddress(address),
    ...(account ? [getAddress(account)] : []),
  ] as const;

/**
 * React Query hook for fetching asset balance details
 *
 * @param params - Object containing the asset address and account
 * @returns Query result with asset balance data and query key
 */
export function useAssetBalanceDetail({
  address,
  account,
}: AssetBalanceDetailProps) {
  const queryKey = getQueryKey({ address, account });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getAssetBalanceDetail({ address, account }),
  });

  return {
    ...result.data,
    queryKey,
  };
}
