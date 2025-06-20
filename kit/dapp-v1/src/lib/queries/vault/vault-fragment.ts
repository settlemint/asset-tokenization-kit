import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * Fragment for XvPSettlementFlow
 */
export const VaultListFragment = theGraphGraphqlKit(
  `
  fragment VaultListFragment on Vault {
    id
    lastActivity
    paused
    pendingTransactionsCount
    totalSigners
    requiredSigners
    executedTransactionsCount
  }
`
);
