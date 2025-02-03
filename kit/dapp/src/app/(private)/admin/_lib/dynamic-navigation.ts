import type {} from '@/components/layout/nav-main';
import {
  theGraphClientStarterkits as theGraphClient,
  theGraphGraphqlStarterkits as theGraphGraphql,
} from '@/lib/settlemint/the-graph';

const AssetsFragment = theGraphGraphql(`
  fragment AssetsFragment on Asset {
    symbol
    name
    id
  }
`);

const NavigationQuery = theGraphGraphql(
  `
  query NavigationQuery {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc) {
      ...AssetsFragment
    }
    equities(orderBy: totalSupplyExact, orderDirection: desc) {
      ...AssetsFragment
    }
    bonds(orderBy: totalSupplyExact, orderDirection: desc) {
      ...AssetsFragment
    }
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc) {
      ...AssetsFragment
    }
    funds(orderBy: totalSupplyExact, orderDirection: desc) {
      ...AssetsFragment
    }
  }
`,
  [AssetsFragment]
);

export async function getAssets() {
  return await theGraphClient.request(NavigationQuery);
}
