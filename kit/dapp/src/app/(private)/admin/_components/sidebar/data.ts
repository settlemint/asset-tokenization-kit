import type { assetConfig } from '@/lib/config/assets';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const SidebarAssetsFragment = theGraphGraphqlStarterkits(`
  fragment SidebarAssetsFragment on Asset {
    symbol
    name
    id
  }
`);

const SidebarAssets = theGraphGraphqlStarterkits(
  `
  query SidebarAssets {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...SidebarAssetsFragment
    }
    equities(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...SidebarAssetsFragment
    }
    bonds(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...SidebarAssetsFragment
    }
    funds(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...SidebarAssetsFragment
    }
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc, first: 10) {
      ...SidebarAssetsFragment
    }
  }
`,
  [SidebarAssetsFragment]
);

export async function getSidebarAssets(): Promise<
  Record<keyof typeof assetConfig, { records: FragmentOf<typeof SidebarAssetsFragment>[]; count: number }>
> {
  const assets = await theGraphClientStarterkits.request(SidebarAssets);

  return {
    stablecoin: {
      records: assets.stableCoins,
      count: assets.stableCoins.length,
    },
    equity: {
      records: assets.equities,
      count: assets.equities.length,
    },
    bond: {
      records: assets.bonds,
      count: assets.bonds.length,
    },
    fund: {
      records: assets.funds,
      count: assets.funds.length,
    },
    cryptocurrency: {
      records: assets.cryptoCurrencies,
      count: assets.cryptoCurrencies.length,
    },
  };
}
