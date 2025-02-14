import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import BigNumber from 'bignumber.js';

const BondDetails = theGraphGraphqlStarterkits(
  `
  query Bond($id: ID!) {
    bond(id: $id) {
      id
      name
      symbol
      decimals
      totalSupply
      totalSupplyExact
      underlyingAsset
      redeemedAmount
      paused
      holders(first: 5, orderBy: valueExact, orderDirection: desc) {
        valueExact
      }
    }
  }
`
);

export async function getBond(id: string) {
  const data = await theGraphClientStarterkits.request(BondDetails, { id });
  if (!data.bond) {
    throw new Error('Bond not found');
  }

  const totalSupplyExact = new BigNumber(data.bond.totalSupplyExact);
  const topHoldersSum = data.bond.holders.reduce(
    (sum, holder) => sum.plus(new BigNumber(holder.valueExact)),
    new BigNumber(0)
  );

  return {
    ...data.bond,
    concentration: topHoldersSum.dividedBy(totalSupplyExact).multipliedBy(100),
  };
}
