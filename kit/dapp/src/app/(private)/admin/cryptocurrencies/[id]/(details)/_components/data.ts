import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import BigNumber from 'bignumber.js';

const CryptocurrencyDetails = theGraphGraphqlStarterkits(
  `
  query Cryptocurrency($id: ID!) {
    cryptoCurrency(id: $id) {
    id
      name
      symbol
      decimals
      totalSupply
      totalSupplyExact
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

export async function getCryptocurrency(id: string) {
  const data = await theGraphClientStarterkits.request(CryptocurrencyDetails, { id });
  if (!data.cryptoCurrency) {
    throw new Error('Cryptocurrency not found');
  }

  const totalSupplyExact = new BigNumber(data.cryptoCurrency.totalSupplyExact);
  const topHoldersSum = data.cryptoCurrency.holders.reduce(
    (sum, holder) => sum.plus(new BigNumber(holder.valueExact)),
    new BigNumber(0)
  );

  return {
    ...data.cryptoCurrency,
    concentration: topHoldersSum.dividedBy(totalSupplyExact).multipliedBy(100).toNumber(),
  };
}

export type Cryptocurrency = Awaited<ReturnType<typeof getCryptocurrency>>;
