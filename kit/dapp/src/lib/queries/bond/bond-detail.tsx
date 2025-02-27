import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAddress, type Address } from 'viem';
import {
  BondFragment,
  BondFragmentSchema,
  OffchainBondFragment,
  OffchainBondFragmentSchema,
} from './bond-fragment';

/**
 * GraphQL query to fetch on-chain bond details from The Graph
 */
const BondDetail = theGraphGraphqlStarterkits(
  `
  query BondDetail($id: ID!) {
    bond(id: $id) {
      ...BondFragment
    }
  }
`,
  [BondFragment]
);

/**
 * GraphQL query to fetch off-chain bond details from Hasura
 */
const OffchainBondDetail = hasuraGraphql(
  `
  query OffchainBondDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
        ...OffchainBondFragment
    }
  }
`,
  [OffchainBondFragment]
);

/**
 * Props interface for bond detail components
 */
export interface BondDetailProps {
  /** Ethereum address of the bond contract */
  address: Address;
}

/**
 * Fetches and combines on-chain and off-chain bond data
 *
 * @param params - Object containing the bond address
 * @returns Combined bond data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export async function getBondDetail({ address }: BondDetailProps) {
  try {
    const normalizedAddress = getAddress(address);

    const [data, dbBond] = await Promise.all([
      theGraphClientStarterkits.request(BondDetail, { id: address }),
      hasuraClient.request(OffchainBondDetail, { id: normalizedAddress }),
    ]);

    const bond = safeParseWithLogging(BondFragmentSchema, data.bond, 'bond');
    const offchainBond = dbBond.asset[0]
      ? safeParseWithLogging(
          OffchainBondFragmentSchema,
          dbBond.asset[0],
          'offchain bond'
        )
      : undefined;

    const topHoldersSum = bond.holders.reduce(
      (sum, holder) => sum + holder.valueExact,
      0n
    );
    const concentration =
      bond.totalSupplyExact === 0n
        ? 0
        : Number((topHoldersSum * 100n) / bond.totalSupplyExact);

    return {
      ...bond,
      ...{
        private: false,
        ...offchainBond,
      },
      concentration,
    };
  } catch (error) {
    // Re-throw with more context
    throw error instanceof Error
      ? error
      : new Error(`Failed to fetch bond with address ${address}`);
  }
}

/**
 * Generates a consistent query key for bond detail queries
 *
 * @param params - Object containing the bond address
 * @returns Array representing the query key for React Query
 */
export const getQueryKey = ({ address }: BondDetailProps) =>
  ['asset', 'detail', 'bond', getAddress(address)] as const;

/**
 * React Query hook for fetching bond details
 *
 * @param params - Object containing the bond address
 * @returns Query result with bond data and query key
 */
export function useBondDetail({ address }: BondDetailProps) {
  const queryKey = getQueryKey({ address });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getBondDetail({ address }),
  });

  return {
    ...result,
    queryKey,
    // Inline bond config values
    assetType: 'bond' as const,
    urlSegment: 'bonds',
    theGraphTypename: 'Bond' as const,
  };
}
