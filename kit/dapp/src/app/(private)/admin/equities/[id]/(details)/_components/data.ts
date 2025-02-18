import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import BigNumber from 'bignumber.js';

const EquityDetails = theGraphGraphqlStarterkits(
  `
  query Equity($id: ID!) {
    equity(id: $id) {
      id
      name
      symbol
      decimals
      totalSupply
      totalSupplyExact
      isin
      equityCategory
      equityClass
      creator {
        id
      }
      holders(first: 5, orderBy: valueExact, orderDirection: desc) {
        valueExact
      }
    }
  }
`
);

export async function getEquity(id: string) {
  const data = await theGraphClientStarterkits.request(EquityDetails, { id });
  if (!data.equity) {
    throw new Error('Equity not found');
  }

  const totalSupplyExact = new BigNumber(data.equity.totalSupplyExact);
  const topHoldersSum = data.equity.holders.reduce(
    (sum, holder) => sum.plus(new BigNumber(holder.valueExact)),
    new BigNumber(0)
  );

  return {
    ...data.equity,
    concentration: topHoldersSum.dividedBy(totalSupplyExact).multipliedBy(100).toNumber(),
  };
}

export type Equity = Awaited<ReturnType<typeof getEquity>>;
