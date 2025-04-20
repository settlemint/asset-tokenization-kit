import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

export const UnderlyingAssetFragment = theGraphGraphqlKit(`
  fragment UnderlyingAssetFragment on Asset {
    id
    symbol
    decimals
    type
    totalSupply
  }
`);

export const YieldPeriodFragment = theGraphGraphqlKit(`
  fragment YieldPeriodFragment on YieldPeriod {
    id
    periodId
    startDate
    endDate
    totalClaimed
    totalClaimedExact
    totalYield
    totalYieldExact
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
    underlyingBalance
    underlyingBalanceExact
    periods {
      ...YieldPeriodFragment
    }
    underlyingAsset {
      ...UnderlyingAssetFragment
    }
  }
`,
  [YieldPeriodFragment, UnderlyingAssetFragment]
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
    underlyingAsset {
      ...UnderlyingAssetFragment
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
    underlyingBalanceExact
    totalUnderlyingNeeded
    totalUnderlyingNeededExact
    cap
    deployedOn
    concentration
  }
`,
  [YieldScheduleFragment, UnderlyingAssetFragment]
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
