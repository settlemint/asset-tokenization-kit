import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getAddress } from 'viem';

const StableCoinTitle = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: ID!) {
    stableCoin(id: $id) {
    id
    name
    symbol    }
  }
`
);

const OffchainStableCoin = hasuraGraphql(`
  query OffchainStableCoin($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      id
      private
    }
  }
`);

export async function getStableCoinTitle(id: string) {
  const normalizedId = getAddress(id);
  const [data, dbStableCoin] = await Promise.all([
    theGraphClientStarterkits.request(StableCoinTitle, { id }),
    hasuraClient.request(OffchainStableCoin, { id: normalizedId }),
  ]);

  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }

  return {
    ...data.stableCoin,
    ...(dbStableCoin.asset[0]
      ? dbStableCoin.asset[0]
      : {
          private: false,
        }),
  };
}
