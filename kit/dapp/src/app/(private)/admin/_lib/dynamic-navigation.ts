import type {} from '@/components/layout/nav-main';
import {
  theGraphClientStarterkits as theGraphClient,
  theGraphGraphqlStarterkits as theGraphGraphql,
} from '@/lib/settlemint/the-graph';
import { unstable_cache } from 'next/cache';
import { ASSETS_SIDEBAR_CACHE_KEY } from './consts';

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
  }
`,
  [AssetsFragment]
);

export async function getAssets() {
  return await unstable_cache(() => theGraphClient.request(NavigationQuery), [ASSETS_SIDEBAR_CACHE_KEY], {
    revalidate: 60,
    tags: [ASSETS_SIDEBAR_CACHE_KEY],
  })();
}
