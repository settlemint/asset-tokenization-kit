'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { unstable_cache } from 'next/cache';

const TokenSupplyQuery = theGraphGraphqlStarterkits(`
  query TokenSupply {
    stableCoins {
      id
      totalSupply
    }
    bonds {
      id
      totalSupply
    }
    equities {
      id
      totalSupply
    }
    cryptoCurrencies {
      id
      totalSupply
    }
  }
`);

export type TokenSupplyData = {
  totalSupply: number;
  breakdown: {
    type: string;
    supply: number;
  }[];
};

export async function getTokenSupplyData(): Promise<TokenSupplyData> {
  const data = await unstable_cache(
    async () => {
      return await theGraphClientStarterkits.request(TokenSupplyQuery);
    },
    ['token-supply'],
    {
      revalidate: 60,
      tags: ['token-supply'],
    }
  )();

  // Process the data for each token type
  const breakdown = [
    {
      type: 'Stablecoins',
      supply: data.stableCoins.reduce((sum, token) => sum + Number.parseFloat(token.totalSupply), 0),
    },
    {
      type: 'Bonds',
      supply: data.bonds.reduce((sum, token) => sum + Number.parseFloat(token.totalSupply), 0),
    },
    {
      type: 'Equities',
      supply: data.equities.reduce((sum, token) => sum + Number.parseFloat(token.totalSupply), 0),
    },
    {
      type: 'Cryptocurrencies',
      supply: data.cryptoCurrencies.reduce((sum, token) => sum + Number.parseFloat(token.totalSupply), 0),
    },
  ];

  const totalSupply = breakdown.reduce((sum, item) => sum + item.supply, 0);

  return {
    totalSupply,
    breakdown,
  };
}
