import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getAddress } from 'viem';

const EquityTitle = theGraphGraphqlStarterkits(
  `
  query Equity($id: ID!) {
    equity(id: $id) {
      id
      name
      symbol
      paused
      decimals
    }
  }
`
);

const OffchainEquity = hasuraGraphql(`
  query OffchainEquity($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      id
      private
    }
  }
`);

export async function getEquityTitle(id: string) {
  const normalizedId = getAddress(id);
  const [data, dbEquity] = await Promise.all([
    theGraphClientStarterkits.request(EquityTitle, { id }),
    hasuraClient.request(OffchainEquity, { id: normalizedId }),
  ]);

  if (!data.equity) {
    throw new Error('Equity not found');
  }

  return {
    ...data.equity,
    ...(dbEquity.asset[0]
      ? dbEquity.asset[0]
      : {
          private: false,
        }),
  };
}
