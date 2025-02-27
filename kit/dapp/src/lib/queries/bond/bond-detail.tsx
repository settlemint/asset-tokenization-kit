import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
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
 * Cached function to fetch raw bond data from both on-chain and off-chain sources
 */
const fetchBondDetailData = unstable_cache(
  async (address: Address) => {
    const normalizedAddress = getAddress(address);

    const [data, dbBond] = await Promise.all([
      theGraphClientStarterkits.request(BondDetail, { id: address }),
      hasuraClient.request(OffchainBondDetail, { id: normalizedAddress }),
    ]);

    return { data, dbBond };
  },
  ['asset', 'detail', 'bond'],
  {
    revalidate: 60 * 60,
    tags: ['asset', 'bond'],
  }
);

/**
 * Fetches and combines on-chain and off-chain bond data
 *
 * @param params - Object containing the bond address
 * @returns Combined bond data with additional calculated metrics
 */
export async function getBondDetail({ address }: BondDetailProps) {
  const normalizedAddress = getAddress(address);
  const { data, dbBond } = await fetchBondDetailData(normalizedAddress);

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
}
