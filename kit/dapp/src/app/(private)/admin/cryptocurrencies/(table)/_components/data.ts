import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { getAddress } from 'viem';

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

const OffchainAssets = hasuraGraphql(`
  query OffchainAssets {
    asset_aggregate {
      nodes {
        id
        private
      }
    }
  }
`);

export type CryptoCurrencyAsset = FragmentOf<typeof CryptoCurrencyFragment>;

export async function getCryptocurrencies() {
  const [theGraphData, dbAssets] = await Promise.all([
    theGraphClientStarterkits.request(CryptoCurrencies),
    hasuraClient.request(OffchainAssets),
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
