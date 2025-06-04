import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for airdrop recipient data from Hasura
 *
 * @remarks
 * Contains recipient-specific data with airdrop and asset information
 * This fragment assumes we're querying airdrop_distribution and need to join
 * with airdrop contract data via The Graph to get asset details
 */
export const AirdropRecipientFragment = hasuraGraphql(`
  fragment AirdropRecipientFragment on airdrop_distribution {
    airdrop: airdrop_id
    amount
    index
  }
`);

/**
 * GraphQL fragment for airdrop recipient data from The Graph
 *
 * @remarks
 * Contains recipient-specific claim data from on-chain events
 * Includes claim timestamps and total claimed amounts for status calculation
 */
export const AirdropClaimFragment = theGraphGraphqlKit(`
  fragment AirdropClaimFragment on AirdropRecipient {
    id
    firstClaimedTimestamp
    lastClaimedTimestamp
    totalClaimedByRecipient
    totalClaimedByRecipientExact
  }
`);
