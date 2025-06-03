import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";
import { AirdropFragment } from "../airdrop/airdrop-fragment";

/**
 * GraphQL fragment for push airdrop data
 *
 * @remarks
 * Extends the base AirdropFragment with push-specific fields including
 * the total distributed amount
 */
export const PushAirdropFragment = theGraphGraphqlKit(
  `
  fragment PushAirdropFragment on PushAirdrop {
    ...AirdropFragment
    totalDistributed
  }
`,
  [AirdropFragment]
);
