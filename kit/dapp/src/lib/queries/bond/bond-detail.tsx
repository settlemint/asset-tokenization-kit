import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { formatNumber } from '@/lib/utils/number';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { cache } from 'react';
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
export const getBondDetail = cache(async ({ address }: BondDetailProps) => {
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
    totalSupply: formatNumber(bond.totalSupply),
  };
});
