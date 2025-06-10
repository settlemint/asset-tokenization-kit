import { hasuraGraphql } from "@/lib/settlemint/hasura";
import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for on-chain airdrop data from The Graph
 *
 * @remarks
 * Contains core airdrop properties including ID, asset, total claimed amounts, and recipients
 */
export const AirdropFragment = theGraphGraphqlKit(`
  fragment AirdropFragment on Airdrop {
    type: __typename
    __typename
    id
    asset: token {
      id
      symbol
      type
      decimals
    }
    totalClaimed
    totalClaimedExact
    totalRecipients
    owner {
      id
    }
  }
`);

/**
 * GraphQL fragment for off-chain airdrop data from Hasura
 *
 * @remarks
 * Contains additional airdrop distribution data stored in the database
 */
export const OffchainAirdropFragment = hasuraGraphql(`
  fragment OffchainAirdropFragment on airdrop_distribution {
    airdrop: airdrop_id
    index
    recipient
    amount
    amountExact: amount_exact
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
