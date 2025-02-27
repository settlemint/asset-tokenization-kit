import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { unstable_cache } from 'next/cache';
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
 * Cached function to fetch raw cryptocurrency data from both on-chain and off-chain sources
 */
const fetchCryptoCurrencyDetailData = unstable_cache(
  async (address: Address) => {
    const normalizedAddress = getAddress(address);

    const [data, dbCryptoCurrency] = await Promise.all([
      theGraphClientStarterkits.request(CryptoCurrencyDetail, { id: address }),
      hasuraClient.request(OffchainCryptoCurrencyDetail, {
        id: normalizedAddress,
      }),
    ]);

    return { data, dbCryptoCurrency };
  },
  ['asset', 'detail', 'cryptocurrency'],
  {
    revalidate: 60 * 60,
    tags: ['asset', 'cryptocurrency'],
  }
);

/**
 * Fetches and combines on-chain and off-chain cryptocurrency data
 *
 * @param params - Object containing the cryptocurrency address
 * @returns Combined cryptocurrency data with additional calculated metrics
 */
export async function getCryptoCurrencyDetail({
  address,
}: CryptoCurrencyDetailProps) {
  const normalizedAddress = getAddress(address);
  const { data, dbCryptoCurrency } =
    await fetchCryptoCurrencyDetailData(normalizedAddress);

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
  };
}
