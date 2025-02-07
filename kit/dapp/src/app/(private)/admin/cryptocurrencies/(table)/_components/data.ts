import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
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
  query CryptoCurrencies {
    cryptoCurrencies {
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
  query OffchainCryptoCurrencies {
    asset_aggregate {
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
  const [theGraphData, dbAssets] = await Promise.all([
    theGraphClientStarterkits.request(CryptoCurrencies),
    hasuraClient.request(OffchainCryptoCurrencies),
  ]);

  const theGraphCryptocurrencies = theGraphData.cryptoCurrencies;
  const assetsById = new Map(dbAssets.asset_aggregate.nodes.map((asset) => [getAddress(asset.id), asset]));

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
