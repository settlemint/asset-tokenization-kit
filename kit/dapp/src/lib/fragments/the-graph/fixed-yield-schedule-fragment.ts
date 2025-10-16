import { theGraphGraphql } from "@/lib/settlemint/the-graph";
import type { FragmentOf } from "@settlemint/sdk-thegraph";

/**
 * The fixed yield schedule period data from The Graph
 */
export type TokenFixedYieldSchedulePeriod = FragmentOf<
  typeof TokenFixedYieldSchedulePeriodFragment
>;

/**
 * The fixed yield schedule data from The Graph
 */
export type TokenFixedYieldSchedule = FragmentOf<
  typeof TokenFixedYieldScheduleFragment
>;

/**
 * GraphQL fragment for token fixed yield schedule period data from The Graph
 * @remarks
 * Contains the period-specific data for a fixed yield schedule, including:
 * - Period identification and timing (id, start/end dates)
 * - Yield tracking for the period (total claimed, unclaimed, and total yield)
 *
 * This fragment is reused across currentPeriod, nextPeriod, and periods arrays
 * to ensure consistency in period data structure throughout the application.
 */
export const TokenFixedYieldSchedulePeriodFragment = theGraphGraphql(`
  fragment TokenFixedYieldSchedulePeriodFragment on TokenFixedYieldSchedulePeriod {
    id
    startDate
    endDate
    totalClaimed
    totalUnclaimedYield
    totalYield
  }
`);

/**
 * GraphQL fragment for token fixed yield schedule data from The Graph
 * @remarks
 * Contains the fixed yield schedule details for a token, including:
 * - Schedule configuration (start/end dates, rate, interval)
 * - Yield tracking (total claimed, unclaimed, and total yield)
 * - Denomination asset reference
 * - Period management (current, next, and all periods using reusable period fragment)
 *
 * This fragment matches the structure expected by the fixed yield schedule
 * read endpoint and corresponds to the Zod schema validation.
 */
export const TokenFixedYieldScheduleFragment = theGraphGraphql(
  `
  fragment TokenFixedYieldScheduleFragment on TokenFixedYieldSchedule {
    id
    startDate
    endDate
    rate
    interval
    totalClaimed
    totalUnclaimedYield
    totalYield
    denominationAsset {
      id
      decimals
      symbol
    }
    currentPeriod {
      ...TokenFixedYieldSchedulePeriodFragment
    }
    nextPeriod {
      ...TokenFixedYieldSchedulePeriodFragment
    }
    periods(orderBy: startDate, orderDirection: asc) {
      ...TokenFixedYieldSchedulePeriodFragment
    }
  }
`,
  [TokenFixedYieldSchedulePeriodFragment]
);
