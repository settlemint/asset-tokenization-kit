import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for linear vesting strategy data
 *
 * @remarks
 * Contains only the fields needed for status calculation:
 * cliff duration, vesting duration, and minimal vesting data
 * for filtering by recipient address
 */
export const LinearVestingStrategyFragment = theGraphGraphqlKit(`
  fragment LinearVestingStrategyFragment on LinearVestingStrategy {
    id
    cliffDuration
    vestingDuration
  }
`);
