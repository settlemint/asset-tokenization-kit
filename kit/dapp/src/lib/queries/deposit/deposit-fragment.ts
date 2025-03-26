import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for on-chain tokenized deposit data from The Graph
 *
 * @remarks
 * Contains core tokenized deposit properties including ID, name, symbol, supply, and holders
 */
export const DepositFragment = theGraphGraphqlKit(`
  fragment DepositFragment on Deposit {
    id
    name
    symbol
    decimals
    totalSupply
    totalSupplyExact
    totalBurned
    totalBurnedExact
    totalHolders
    collateral
    collateralRatio
    freeCollateral
    lastCollateralUpdate
    liveness
    paused
    creator {
      id
    }
    concentration
  }
`);

/**
 * GraphQL fragment for off-chain tokenized deposit data from Hasura
 *
 * @remarks
 * Contains additional metadata about tokenized deposits stored in the database
 */
export const OffchainDepositFragment = hasuraGraphql(`
  fragment OffchainDepositFragment on asset {
    id
    isin
  }
`);
