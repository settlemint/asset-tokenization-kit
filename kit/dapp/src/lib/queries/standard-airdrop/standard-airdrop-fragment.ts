import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { AirdropFragment } from "../airdrop/airdrop-fragment";

/**
 * GraphQL fragment for standard airdrop data
 */
export const StandardAirdropFragment = theGraphGraphqlKit(
  `
  fragment StandardAirdropFragment on StandardAirdrop {
    ...AirdropFragment
    startTime
    endTime
  }
`,
  [AirdropFragment]
);
