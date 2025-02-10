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

const calculateSupplyPercentage = (supply: BigNumber, totalSupply: BigNumber): number =>
  Number(formatNumber(supply.dividedBy(totalSupply).multipliedBy(100), { decimals: 2 }));

export interface AssetBreakdown {
  type: 'Stablecoins' | 'Bonds' | 'Equities' | 'Crypto Currencies' | 'Funds';
  supplyPercentage: number;
  supply: string;
}

export async function getAssetsWidgetData() {
  const data = await theGraphClientStarterkits.request(AssetsSupplyQuery);

  const supplies = {
    stablecoins: calculateTotalSupply(data.stableCoins),
    bonds: calculateTotalSupply(data.bonds),
    equities: calculateTotalSupply(data.equities),
    cryptoCurrencies: calculateTotalSupply(data.cryptoCurrencies),
    funds: calculateTotalSupply(data.funds),
  };

  const totalSupply = Object.values(supplies).reduce((sum, value) => sum.plus(value), new BigNumber(0));

  const breakdown: AssetBreakdown[] = [
    {
      type: 'Stablecoins',
      supplyPercentage: calculateSupplyPercentage(supplies.stablecoins, totalSupply),
      supply: formatNumber(supplies.stablecoins),
    },
    {
      type: 'Bonds',
      supplyPercentage: calculateSupplyPercentage(supplies.bonds, totalSupply),
      supply: formatNumber(supplies.bonds),
    },
    {
      type: 'Equities',
      supplyPercentage: calculateSupplyPercentage(supplies.equities, totalSupply),
      supply: formatNumber(supplies.equities),
    },
    {
      type: 'Crypto Currencies',
      supplyPercentage: calculateSupplyPercentage(supplies.cryptoCurrencies, totalSupply),
      supply: formatNumber(supplies.cryptoCurrencies),
    },
    {
      type: 'Funds',
      supplyPercentage: calculateSupplyPercentage(supplies.funds, totalSupply),
      supply: formatNumber(supplies.funds),
    },
  ];

  return {
    totalSupply: formatNumber(totalSupply),
    breakdown,
  };
}
