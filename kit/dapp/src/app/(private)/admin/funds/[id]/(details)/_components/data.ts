import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import BigNumber from 'bignumber.js';

const FundDetails = theGraphGraphqlStarterkits(
  `
  query Fund($id: ID!) {
    fund(id: $id) {
      id
      name
      symbol
      decimals
      totalSupply
      totalSupplyExact
      fundCategory
      fundClass
      creator {
        id
      }
      paused
      isin
      holders(first: 5, orderBy: valueExact, orderDirection: desc) {
        valueExact
      }
    }
  }
`
);

export async function getFund(id: string) {
  const data = await theGraphClientStarterkits.request(FundDetails, { id });
  if (!data.fund) {
    throw new Error('Fund not found');
  }
  const totalSupplyExact = new BigNumber(data.fund.totalSupplyExact);
  const topHoldersSum = data.fund.holders.reduce(
    (sum, holder) => sum.plus(new BigNumber(holder.valueExact)),
    new BigNumber(0)
  );

  return {
    ...data.fund,
    concentration: topHoldersSum.dividedBy(totalSupplyExact).multipliedBy(100).toNumber(),
  };
}

export type Fund = Awaited<ReturnType<typeof getFund>>;
