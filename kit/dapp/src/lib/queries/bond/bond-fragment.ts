import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

export const YieldPeriodFragment = theGraphGraphqlKit(`
  fragment YieldPeriodFragment on YieldPeriod {
    id
    periodId
    startDate
    endDate
    rate
    totalClaimed
    totalClaimedExact
  }
`);

export const YieldScheduleFragment = theGraphGraphqlKit(
  `
  fragment YieldScheduleFragment on FixedYield {
    id
      startDate
      endDate
      rate
      interval
      totalClaimed
      totalClaimedExact
      unclaimedYield
      unclaimedYieldExact
      underlyingAsset {
        id
        symbol
        decimals
        type
      }
      underlyingBalance
      underlyingBalanceExact
      periods {
        ...YieldPeriodFragment
      }
  }
`,
  [YieldPeriodFragment]
);

/**
 * GraphQL fragment for on-chain bond data from The Graph
 *
 * @remarks
 * Contains core bond properties including ID, name, symbol, supply, and holders
 */
export const BondFragment = theGraphGraphqlKit(
  `
  fragment BondFragment on Bond {
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
    creator {
      id
    }
    holders(first: 5, orderBy: valueExact, orderDirection: desc) {
      valueExact
    }
    underlyingAsset {
      id
      symbol
      decimals
      type
    }
    maturityDate
    isMatured
    hasSufficientUnderlying
    yieldSchedule {
      ...YieldScheduleFragment
    }
    redeemedAmount
    faceValue
    underlyingBalance
    totalUnderlyingNeeded
    totalUnderlyingNeededExact
    cap
    deployedOn
  }
`,
  [YieldScheduleFragment]
);

/**
 * GraphQL fragment for off-chain bond data from Hasura
 *
 * @remarks
 * Contains additional metadata about bonds stored in the database
 */
export const OffchainBondFragment = hasuraGraphql(`
  fragment OffchainBondFragment on asset {
    id
    isin
  }
`);
