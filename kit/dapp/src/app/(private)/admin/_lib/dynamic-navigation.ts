import type { SidebarSection } from '@/components/layout/nav-main';
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

const createTokenItems = (tokens: FragmentOf<typeof TokenFragment>[], type: string) => {
  const items = tokens.slice(0, 5).map((token) => ({
    title: token.symbol ?? token.name ?? token.id,
    url: `/admin/${type}/${token.id}`,
  }));

  if (tokens.length > 5) {
    return {
      items,
      more: {
        enabled: true,
        url: `/admin/${type}`,
      },
    };
  }

  return { items, more: undefined };
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

export async function createMainSideBarData(role: 'admin' | 'issuer' | 'user'): Promise<SidebarSection[]> {
  const navigationData = await theGraphClient.request(NavigationQuery);

  const hasTokens = TOKEN_SECTIONS.some((section) => navigationData[section.key]?.length > 0);

  if (!hasTokens || role === 'user') {
    return [];
  }

  let firstSectionFound = false;

  return [
    {
      title: 'Token Management',
      items: TOKEN_SECTIONS.reduce<SidebarSection['items']>((acc, section) => {
        const tokens = navigationData[section.key];
        if (tokens?.length > 0) {
          const { items, more } = createTokenItems(tokens, section.type);
          acc.push({
            title: section.title,
            iconName: section.iconName,
            open: !firstSectionFound,
            items,
            more,
          });
          firstSectionFound = true;
        }
        return acc;
      }, []),
    },
  ];
}
