import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for on-chain equity data from The Graph
 *
 * @remarks
 * Contains core equity properties including ID, name, symbol, supply, and holders
 */
export const EquityFragment = theGraphGraphqlKit(`
  fragment EquityFragment on Equity {
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
    equityCategory
    equityClass
    creator {
      id
    }
    concentration
  }
`);

/**
 * GraphQL fragment for off-chain equity data from Hasura
 *
 * @remarks
 * Contains additional metadata about equities stored in the database
 */
export const OffchainEquityFragment = hasuraGraphql(`
  fragment OffchainEquityFragment on asset {
    id
    isin
  }
`);
