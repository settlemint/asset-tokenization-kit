import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { getAddress } from 'viem';

const CryptocurrencyTitle = theGraphGraphqlStarterkits(
  `
  query Cryptocurrency($id: ID!) {
    cryptoCurrency(id: $id) {
    id
    name
    symbol
    decimals
    }
  }
`
);

const OffchainCryptocurrency = hasuraGraphql(`
  query OffchainCryptocurrency($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      id
      private
    }
  }
`);

export type Cryptocurrency = Awaited<ReturnType<typeof getCryptocurrency>>;

export async function getCryptocurrency(id: string) {
  const normalizedId = getAddress(id);
  const [data, dbCrypto] = await Promise.all([
    theGraphClientStarterkits.request(CryptocurrencyTitle, { id }),
    hasuraClient.request(OffchainCryptocurrency, { id: normalizedId }),
  ]);

  if (!data.cryptoCurrency) {
    throw new Error('Cryptocurrency not found');
  }

  return {
    ...data.cryptoCurrency,
    ...(dbCrypto.asset[0]
      ? dbCrypto.asset[0]
      : {
          private: false,
        }),
  };
}
