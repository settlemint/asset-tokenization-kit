import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { AirdropFragment } from "../airdrop/airdrop-fragment";
import { LinearVestingStrategyFragment } from "./linear-vesting-strategy-fragment";

/**
 * GraphQL fragment for vesting airdrop data
 *
 * @remarks
 * Extends the base AirdropFragment with vesting-specific fields including
 * claim period end time and vesting strategy details for linear vesting
 */
export const VestingAirdropFragment = theGraphGraphqlKit(
  `
  fragment VestingAirdropFragment on VestingAirdrop {
    ...AirdropFragment
    claimPeriodEnd
    strategy {
      ... on LinearVestingStrategy {
        ...LinearVestingStrategyFragment
      }
    }
  }
`,
  [AirdropFragment, LinearVestingStrategyFragment]
);
