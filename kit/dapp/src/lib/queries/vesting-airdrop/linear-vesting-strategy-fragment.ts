import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for linear vesting strategy data
 *
 * @remarks
 * Contains the core linear vesting strategy properties including
 * contract ID, cliff duration, vesting duration, and associated vesting data
 */
export const LinearVestingStrategyFragment = theGraphGraphqlKit(`
  fragment LinearVestingStrategyFragment on LinearVestingStrategy {
    id
    cliffDuration
    vestingDuration
    vestingData {
      id
    }
  }
`);
