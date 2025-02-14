import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import BigNumber from 'bignumber.js';

const StableCoinDetails = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: ID!) {
    stableCoin(id: $id) {
      id
      name
      symbol
      decimals
      totalSupply
      totalSupplyExact
      collateral
      isin
      holders(first: 5, orderBy: valueExact, orderDirection: desc) {
        valueExact
      }
    }
  }
`
);

export async function getStableCoin(id: string) {
  const data = await theGraphClientStarterkits.request(StableCoinDetails, { id });
  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }

  const totalSupplyExact = new BigNumber(data.stableCoin.totalSupplyExact);
  const topHoldersSum = data.stableCoin.holders.reduce(
    (sum, holder) => sum.plus(new BigNumber(holder.valueExact)),
    new BigNumber(0)
  );

  return {
    ...data.stableCoin,
    concentration: topHoldersSum.dividedBy(totalSupplyExact).multipliedBy(100),
  };
}
