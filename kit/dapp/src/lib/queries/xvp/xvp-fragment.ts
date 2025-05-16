import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * Fragment for XvPSettlementFlow
 */
export const XvPSettlementFlowFragment = theGraphGraphqlKit(
  `
  fragment XvPSettlementFlowFragment on XvPSettlementFlow {
    id
    from {
      id
    }
    to {
      id
    }
    amount
    asset {
      id
      symbol
      type
      decimals
    }
  }
`
);

/**
 * Fragment for XvPSettlementApproval
 */
export const XvPSettlementApprovalFragment = theGraphGraphqlKit(`
  fragment XvPSettlementApprovalFragment on XvPSettlementApproval {
    id
    account {
      id
    }
    approved
    timestamp
  }
`);

/**
 * Fragment for XvPSettlement
 */
export const XvPSettlementFragment = theGraphGraphqlKit(
  `
  fragment XvPSettlementFragment on XvPSettlement {
    id
    cutoffDate
    autoExecute
    executed
    cancelled
    createdAt
    approvals {
      ...XvPSettlementApprovalFragment
    }
    flows {
      ...XvPSettlementFlowFragment
    }
  }
`,
  [XvPSettlementApprovalFragment, XvPSettlementFlowFragment]
);
