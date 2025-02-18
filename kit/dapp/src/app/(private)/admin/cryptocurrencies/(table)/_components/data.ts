import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/utils/pagination';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { type Prettify, getAddress } from 'viem';

const CryptoCurrencyFragment = theGraphGraphqlStarterkits(`
  fragment CryptoCurrencyFields on CryptoCurrency {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);

const CryptoCurrencies = theGraphGraphqlStarterkits(
  `
  query CryptoCurrencies($first: Int, $skip: Int) {
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...CryptoCurrencyFields
    }
  }
`,
  [CryptoCurrencyFragment]
);

const OffchainCryptoCurrencyFragment = hasuraGraphql(`
  fragment OffchainCryptoCurrenciesFields on asset_aggregate {
      nodes {
        id
        private
      }
  }
`);

const OffchainCryptoCurrencies = hasuraGraphql(
  `
  query OffchainCryptoCurrencies($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      ...OffchainCryptoCurrenciesFields
    }
  }
`,
  [OffchainCryptoCurrencyFragment]
);

export type CryptoCurrencyAsset = Prettify<
  FragmentOf<typeof CryptoCurrencyFragment> & FragmentOf<typeof OffchainCryptoCurrencyFragment>['nodes'][number]
>;

export async function getCryptocurrencies(): Promise<CryptoCurrencyAsset[]> {
  const [theGraphCryptocurrencies, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(CryptoCurrencies, { first, skip });
      return result.cryptoCurrencies;
    }),
    fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(OffchainCryptoCurrencies, { limit, offset });
      return result.asset_aggregate.nodes;
    }),
  ]);

  const assetsById = new Map(dbAssets.map((asset) => [getAddress(asset.id), asset]));

  const cryptocurrencies = theGraphCryptocurrencies.map((cryptocurrency) => {
    const dbAsset = assetsById.get(getAddress(cryptocurrency.id));
    return {
      ...cryptocurrency,
      ...(dbAsset
        ? dbAsset
        : {
            private: false,
          }),
    };
  });

  return cryptocurrencies;
}
