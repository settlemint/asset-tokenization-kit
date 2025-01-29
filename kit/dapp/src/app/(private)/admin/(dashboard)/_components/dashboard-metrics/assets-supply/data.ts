'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const AssetsSupplyQuery = theGraphGraphqlStarterkits(`
  query AssetsSupply {
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

export type AssetsSupplyData = {
  totalSupply: string;
  breakdown: {
    type: string;
    supply: string;
  }[];
};

/**
 * Calculates total supply for an array of tokens using native BigInt
 */
const calculateTotalSupply = (tokens: { totalSupply: string }[]): string => {
  const total = tokens.reduce((sum, token) => sum + BigInt(token.totalSupply), BigInt(0));
  return total.toString();
};

export async function getAssetsSupplyData(): Promise<AssetsSupplyData> {
  const data = await theGraphClientStarterkits.request(AssetsSupplyQuery);

  const breakdown = [
    {
      type: 'Stablecoins',
      supply: calculateTotalSupply(data.stableCoins),
    },
    {
      type: 'Bonds',
      supply: calculateTotalSupply(data.bonds),
    },
    {
      type: 'Equities',
      supply: calculateTotalSupply(data.equities),
    },
    {
      type: 'Cryptocurrencies',
      supply: calculateTotalSupply(data.cryptoCurrencies),
    },
  ];

  const totalSupply = breakdown.reduce((sum, item) => sum + BigInt(item.supply), BigInt(0)).toString();

  return {
    totalSupply,
    breakdown,
  };
}
