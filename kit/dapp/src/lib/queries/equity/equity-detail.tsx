import { assetConfig } from '@/lib/config/assets';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAddress, type Address } from 'viem';
import {
  EquityFragment,
  EquityFragmentSchema,
  OffchainEquityFragment,
  OffchainEquityFragmentSchema,
} from './equity-fragment';

/**
 * GraphQL query to fetch on-chain equity details from The Graph
 */
const EquityDetail = theGraphGraphqlStarterkits(
  `
  query EquityDetail($id: ID!) {
    equity(id: $id) {
      ...EquityFragment
    }
  }
`,
  [EquityFragment]
);

/**
 * GraphQL query to fetch off-chain equity details from Hasura
 */
const OffchainEquityDetail = hasuraGraphql(
  `
  query OffchainEquityDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
        ...OffchainEquityFragment
    }
  }
`,
  [OffchainEquityFragment]
);

/**
 * Props interface for equity detail components
 */
export interface EquityDetailProps {
  /** Ethereum address of the equity contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain equity data
 *
 * @param params - Object containing the equity address
 * @returns Combined equity data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export async function getEquityDetail({ address }: EquityDetailProps) {
  try {
    const normalizedAddress = getAddress(address);

    const [data, dbEquity] = await Promise.all([
      theGraphClientStarterkits.request(EquityDetail, { id: address }),
      hasuraClient.request(OffchainEquityDetail, { id: normalizedAddress }),
    ]);

    const equity = safeParseWithLogging(
      EquityFragmentSchema,
      data.equity,
      'equity'
    );
    const offchainEquity = dbEquity.asset[0]
      ? safeParseWithLogging(
          OffchainEquityFragmentSchema,
          dbEquity.asset[0],
          'offchain equity'
        )
      : undefined;

    const topHoldersSum = equity.holders.reduce(
      (sum, holder) => sum + holder.valueExact,
      0n
    );
    const concentration =
      equity.totalSupplyExact === 0n
        ? 0
        : Number((topHoldersSum * 100n) / equity.totalSupplyExact);

    return {
      ...equity,
      ...{
        private: false,
        ...offchainEquity,
      },
      concentration,
    };
  } catch (error) {
    // Re-throw with more context
    throw error instanceof Error
      ? error
      : new Error(`Failed to fetch equity with address ${address}`);
  }
}

/**
 * Generates a consistent query key for equity detail queries
 *
 * @param params - Object containing the equity address
 * @returns Array representing the query key for React Query
 */
export const getQueryKey = ({ address }: EquityDetailProps) =>
  [
    'asset',
    'detail',
    assetConfig.equity.queryKey,
    getAddress(address),
  ] as const;

/**
 * React Query hook for fetching equity details
 *
 * @param params - Object containing the equity address
 * @returns Query result with equity data, config, and query key
 */
export function useEquityDetail({ address }: EquityDetailProps) {
  const queryKey = getQueryKey({ address });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getEquityDetail({ address }),
  });

  return {
    ...result,
    config: assetConfig.equity,
    queryKey,
  };
}
