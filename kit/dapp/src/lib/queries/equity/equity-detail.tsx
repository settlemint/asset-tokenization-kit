import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { formatNumber } from '@/lib/utils/number';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
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
 * Cached function to fetch equity data from both sources
 */
const fetchEquityData = unstable_cache(
  async (address: Address, normalizedAddress: Address) => {
    return Promise.all([
      theGraphClientStarterkits.request(EquityDetail, { id: address }),
      hasuraClient.request(OffchainEquityDetail, { id: normalizedAddress }),
    ]);
  },
  ['asset', 'equity'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
);

/**
 * Fetches and combines on-chain and off-chain equity data
 *
 * @param params - Object containing the equity address
 * @returns Combined equity data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export async function getEquityDetail({ address }: EquityDetailProps) {
  const normalizedAddress = getAddress(address);

  const [data, dbEquity] = await fetchEquityData(address, normalizedAddress);

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
    totalSupply: formatNumber(equity.totalSupply),
  };
}
