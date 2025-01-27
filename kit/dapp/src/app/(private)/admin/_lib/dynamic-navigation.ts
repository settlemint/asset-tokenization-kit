import type { NavGroup, NavItem } from '@/components/layout/nav-main';
import {
  theGraphClientStarterkits as theGraphClient,
  theGraphGraphqlStarterkits as theGraphGraphql,
} from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const TokenFragment = theGraphGraphql(`
  fragment TokenFragment on Asset {
    symbol
    name
    id
  }
`);

const NavigationQuery = theGraphGraphql(
  `
  query NavigationQuery {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc) {
      ...TokenFragment
    }
    equities(orderBy: totalSupplyExact, orderDirection: desc) {
      ...TokenFragment
    }
    bonds(orderBy: totalSupplyExact, orderDirection: desc) {
      ...TokenFragment
    }
    cryptoCurrencies(orderBy: totalSupplyExact, orderDirection: desc) {
      ...TokenFragment
    }
  }
`,
  [TokenFragment]
);

const createTokenItems = (tokens: FragmentOf<typeof TokenFragment>[], type: string): NavItem[] => {
  const items = tokens.slice(0, 5).map<NavItem>((token) => ({
    type: 'Item',
    label: token.symbol ?? token.name ?? token.id,
    path: `/admin/${type}/${token.id}`,
  }));

  if (tokens.length > 5) {
    items.push({
      type: 'Item',
      label: 'More...',
      path: `/admin/${type}`,
    });
  }

  return items;
};

const TOKEN_SECTIONS = [
  {
    key: 'cryptoCurrencies',
    title: 'Crypto Currencies',
    type: 'cryptocurrencies',
    iconName: 'Bitcoin' as const,
  },
  {
    key: 'stableCoins',
    title: 'Stable Coins',
    type: 'stablecoins',
    iconName: 'Coins' as const,
  },
  {
    key: 'equities',
    title: 'Equities',
    type: 'equities',
    iconName: 'Eclipse' as const,
  },
  {
    key: 'bonds',
    title: 'Bonds',
    type: 'bonds',
    iconName: 'TicketCheck' as const,
  },
] as const;

export async function createTokenManagementNavGroup(role: 'admin' | 'issuer' | 'user'): Promise<NavGroup | null> {
  const navigationData = await theGraphClient.request(NavigationQuery);

  if (role === 'user') {
    return null;
  }

  return {
    type: 'Group',
    groupTitle: 'Token management',
    items: TOKEN_SECTIONS.reduce<NavItem[]>((acc, section) => {
      const tokens = navigationData[section.key];

      const items = createTokenItems(tokens, section.type);
      acc.push({
        type: 'Item',
        label: section.title,
        path: `/admin/${section.type}`,
        badge: tokens.length.toString(),
        subItems: items,
      });
      return acc;
    }, []),
  };
}
