import { formatNumber } from '@/lib/number';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import BigNumber from 'bignumber.js';

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
    funds {
      id
      totalSupply
    }
  }
`);

const calculateTotalSupply = (tokens: { totalSupply: string }[]): BigNumber => {
  return tokens.reduce((sum, token) => sum.plus(token.totalSupply), new BigNumber(0));
};

export async function getAssetsWidgetData() {
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
      type: 'Crypto Currencies',
      supply: calculateTotalSupply(data.cryptoCurrencies),
    },
    {
      type: 'Funds',
      supply: calculateTotalSupply(data.funds),
    },
  ];

  const totalSupply = breakdown.reduce((sum, item) => sum.plus(item.supply), new BigNumber(0));

  return {
    totalSupply: formatNumber(totalSupply, {
      decimals: 0,
    }),
    breakdown: breakdown.map((item) => ({
      ...item,
      supply: formatNumber(item.supply, {
        decimals: 0,
      }),
    })),
  };
}
