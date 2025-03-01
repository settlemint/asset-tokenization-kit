import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { formatNumber } from '@/lib/utils/number';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { getAddress, type Address } from 'viem';
import {
  CryptoCurrencyFragment,
  CryptoCurrencyFragmentSchema,
  OffchainCryptoCurrencyFragment,
  OffchainCryptoCurrencyFragmentSchema,
} from './cryptocurrency-fragment';

/**
 * GraphQL query to fetch on-chain cryptocurrency details from The Graph
 */
const CryptoCurrencyDetail = theGraphGraphqlStarterkits(
  `
  query CryptoCurrencyDetail($id: ID!) {
    cryptoCurrency(id: $id) {
      ...CryptoCurrencyFragment
    }
  }
`,
  [CryptoCurrencyFragment]
);

/**
 * GraphQL query to fetch off-chain cryptocurrency details from Hasura
 */
const OffchainCryptoCurrencyDetail = hasuraGraphql(
  `
  query OffchainCryptoCurrencyDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainCryptoCurrencyFragment
    }
  }
`,
  [OffchainCryptoCurrencyFragment]
);

/**
 * Props interface for cryptocurrency detail components
 */
export interface CryptoCurrencyDetailProps {
  /** Ethereum address of the cryptocurrency contract */
  address: Address;
}

/**
 * Cached function to fetch cryptocurrency data from both sources
 */
const fetchCryptoCurrencyData = unstable_cache(
  async (address: Address, normalizedAddress: Address) => {
    return Promise.all([
      theGraphClientStarterkits.request(CryptoCurrencyDetail, { id: address }),
      hasuraClient.request(OffchainCryptoCurrencyDetail, {
        id: normalizedAddress,
      }),
    ]);
  },
  ['asset', 'cryptocurrency'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
);

/**
 * Fetches and combines on-chain and off-chain cryptocurrency data
 *
 * @param params - Object containing the cryptocurrency address
 * @returns Combined cryptocurrency data with additional calculated metrics
 * @throws Error if fetching or parsing fails
 */
export const getCryptoCurrencyDetail = cache(
  async ({ address }: CryptoCurrencyDetailProps) => {
    const normalizedAddress = getAddress(address);

    const [data, dbCryptoCurrency] = await fetchCryptoCurrencyData(
      address,
      normalizedAddress
    );

    const cryptocurrency = safeParseWithLogging(
      CryptoCurrencyFragmentSchema,
      data.cryptoCurrency,
      'cryptocurrency'
    );
    const offchainCryptoCurrency = dbCryptoCurrency.asset[0]
      ? safeParseWithLogging(
          OffchainCryptoCurrencyFragmentSchema,
          dbCryptoCurrency.asset[0],
          'offchain cryptocurrency'
        )
      : undefined;

    const topHoldersSum = cryptocurrency.holders.reduce(
      (sum, holder) => sum + holder.valueExact,
      0n
    );
    const concentration =
      cryptocurrency.totalSupplyExact === 0n
        ? 0
        : Number((topHoldersSum * 100n) / cryptocurrency.totalSupplyExact);

    return {
      ...cryptocurrency,
      ...{
        private: false,
        ...offchainCryptoCurrency,
      },
      concentration,
      totalSupply: formatNumber(cryptocurrency.totalSupply),
    };
  }
);
