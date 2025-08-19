import type { FragmentOf } from "@settlemint/sdk-thegraph";
import { theGraphGraphql } from "@/lib/settlemint/the-graph";

/**
 * The token yield data from The Graph
 */
export type TokenYield = FragmentOf<typeof TokenYieldFragment>;

/**
 * The token fixed yield schedule data from The Graph
 */
export type TokenFixedYieldSchedule = FragmentOf<
  typeof TokenFixedYieldScheduleFragment
>;

export const TokenFixedYieldSchedulePeriodFragment = theGraphGraphql(`
  fragment TokenFixedYieldSchedulePeriodFragment on TokenFixedYieldSchedulePeriod {
    id
    startDate
    endDate
    totalClaimed
    totalUnclaimedYield
    totalYield
    deployedInTransaction
  }
`);

/**
 * GraphQL fragment for token fixed yield schedule data from The Graph
 * @remarks
 * Contains comprehensive yield schedule configuration including rates,
 * intervals, total amounts, and references to current/next periods.
 */
export const TokenFixedYieldScheduleFragment = theGraphGraphql(
  `
  fragment TokenFixedYieldScheduleFragment on TokenFixedYieldSchedule {
    id
    createdAt
    createdBy { id isContract }
    account { id isContract }
    token { id }
    startDate
    endDate
    rate
    interval
    totalClaimed
    totalUnclaimedYield
    totalYield
    denominationAsset {
      id
      symbol
      decimals
    }
    currentPeriod { ...TokenFixedYieldSchedulePeriodFragment }
    nextPeriod { ...TokenFixedYieldSchedulePeriodFragment }
    periods { ...TokenFixedYieldSchedulePeriodFragment }
    deployedInTransaction
  }


`,
  [TokenFixedYieldSchedulePeriodFragment]
);

/**
 * GraphQL fragment for token yield data from The Graph
 * @remarks
 * Contains the yield configuration for a token, primarily serving as a
 * wrapper that references the associated fixed yield schedule.
 */
export const TokenYieldFragment = theGraphGraphql(
  `
  fragment TokenYieldFragment on TokenYield {
    id
    schedule { ...TokenFixedYieldScheduleFragment }
  }
`,
  [TokenFixedYieldScheduleFragment]
);
