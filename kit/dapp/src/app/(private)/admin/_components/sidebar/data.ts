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
    assetStats_collection(interval: hour, first: 1) {
      count
      assetType
    }
  }
`,
  [SidebarAssetsFragment]
);

export async function getSidebarAssets(): Promise<
  Record<keyof typeof assetConfig, { records: FragmentOf<typeof SidebarAssetsFragment>[]; count: number }>
> {
  const assets = await theGraphClientStarterkits.request(SidebarAssets);

  const getCount = (assetType: string) => {
    const stat = assets.assetStats_collection.find((stat) => stat.assetType === assetType);
    return stat ? Number(stat.count) : 0;
  };

  return {
    stablecoin: {
      records: assets.stableCoins,
      count: getCount('stablecoin'),
    },
    equity: {
      records: assets.equities,
      count: getCount('equity'),
    },
    bond: {
      records: assets.bonds,
      count: getCount('bond'),
    },
    fund: {
      records: assets.funds,
      count: getCount('fund'),
    },
    cryptocurrency: {
      records: assets.cryptoCurrencies,
      count: getCount('cryptocurrency'),
    },
  };
}
