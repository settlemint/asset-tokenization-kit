import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for on-chain fund data from The Graph
 *
 * @remarks
 * Contains core fund properties including ID, name, symbol, supply, and holders
 */
export const FundFragment = theGraphGraphqlKit(`
  fragment FundFragment on Fund {
    id
    name
    symbol
    decimals
    totalSupply
    totalSupplyExact
    totalBurned
    totalBurnedExact
    totalHolders
    paused
    fundCategory
    fundClass
    managementFeeBps
    creator {
      id
    }
    holders(first: 5, orderBy: valueExact, orderDirection: desc) {
      valueExact
    }
    asAccount {
      balances {
        value
      }
    }
  }
`);

/**
 * GraphQL fragment for off-chain fund data from Hasura
 *
 * @remarks
 * Contains additional metadata about funds stored in the database
 */
export const OffchainFundFragment = hasuraGraphql(`
  fragment OffchainFundFragment on asset {
    id
    isin
    value_in_base_currency
  }
`);
