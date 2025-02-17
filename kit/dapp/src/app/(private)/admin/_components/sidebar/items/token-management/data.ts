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
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc) {
      ...SidebarAssetsFragment
    }
    equities(orderBy: totalSupplyExact, orderDirection: desc) {
      ...SidebarAssetsFragment
    }
    bonds(orderBy: totalSupplyExact, orderDirection: desc) {
      ...SidebarAssetsFragment
    }
    funds(orderBy: totalSupplyExact, orderDirection: desc) {
      ...SidebarAssetsFragment
    }
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc) {
      ...SidebarAssetsFragment
    }
  }
`,
  [SidebarAssetsFragment]
);

export async function getSidebarAssets(): Promise<
  Record<keyof typeof assetConfig, FragmentOf<typeof SidebarAssetsFragment>[]>
> {
  const assets = await theGraphClientStarterkits.request(SidebarAssets);

  return {
    stablecoin: assets.stableCoins,
    equity: assets.equities,
    bond: assets.bonds,
    fund: assets.funds,
    cryptocurrency: assets.cryptoCurrencies,
  };
}
