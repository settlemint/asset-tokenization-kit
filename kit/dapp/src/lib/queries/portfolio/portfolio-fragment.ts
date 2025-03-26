import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * GraphQL fragment for portfolio asset data from The Graph
 */
export const PortfolioAssetFragment = theGraphGraphqlKit(`
  fragment PortfolioAssetFragment on Asset {
    id
    name
    symbol
    decimals
    type
  }
`);

/**
 * GraphQL fragment for portfolio account data from The Graph
 */
export const PortfolioAccountFragment = theGraphGraphqlKit(`
  fragment PortfolioAccountFragment on Account {
    id
  }
`);

export const PortfolioStatsDataFragment = theGraphGraphqlKit(
  `
  fragment PortfolioStatsDataFragment on PortfolioStatsData {
    timestamp
    account {
      ...PortfolioAccountFragment
    }
    asset {
      ...PortfolioAssetFragment
    }
    balance
    balanceExact
  }
`,
  [PortfolioAccountFragment, PortfolioAssetFragment]
);
