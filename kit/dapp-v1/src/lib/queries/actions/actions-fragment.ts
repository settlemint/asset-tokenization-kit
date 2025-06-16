import "server-only";

import { theGraphGraphqlKit } from "@/lib/settlemint/the-graph";

/**
 * Fragment for basic action fields
 */
export const ActionFragment = theGraphGraphqlKit(
  `
  fragment ActionFragment on Action {
    id
    name
    type
    createdAt
    activeAt
    expiresAt
    executedAt
    executed
    target {
      id
    }
    executedBy {
      id
    }
  }
`
);

/**
 * Fragment for action executor fields with nested executors
 */
export const ActionExecutorFragment = theGraphGraphqlKit(
  `
  fragment ActionExecutorFragment on ActionExecutor {
    id
    executors {
      id
    }
    actions {
      ...ActionFragment
    }
  }
`,
  [ActionFragment]
);
