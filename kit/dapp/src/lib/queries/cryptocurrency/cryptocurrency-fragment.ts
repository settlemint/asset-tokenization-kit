import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for on-chain stablecoin data from The Graph
 *
 * @remarks
 * Contains core stablecoin properties including ID, name, symbol, supply, and holders
 */
export const CryptoCurrencyFragment = theGraphGraphqlKit(`
  fragment CryptoCurrencyFragment on CryptoCurrency {
    id
    name
    symbol
    decimals
    totalSupply
    totalSupplyExact
    totalHolders
    creator {
      id
    }
    holders(first: 5, orderBy: valueExact, orderDirection: desc) {
      valueExact
    }
  }
`);

/**
 * GraphQL fragment for off-chain stablecoin data from Hasura
 *
 * @remarks
 * Contains additional metadata about stablecoins stored in the database
 */
export const OffchainCryptoCurrencyFragment = hasuraGraphql(`
  fragment OffchainCryptoCurrencyFragment on asset {
    id
    isin
  }
`);
