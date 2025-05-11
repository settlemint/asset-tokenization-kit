import "server-only";

import {
  theGraphClientKit,
  theGraphGraphqlKit,
} from "@/lib/settlemint/the-graph";
import { withTracing } from "@/lib/utils/tracing";
import { safeParse } from "@/lib/utils/typebox";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { cache } from "react";
import { ActionFragment } from "./actions-fragment";
import { ActionSchema } from "./actions-schema";

/**
 * GraphQL query to fetch a single action detail by ID
 */
const ActionDetail = theGraphGraphqlKit(
  `
  query ActionDetail($id: ID!) {
    action(id: $id) {
      ...ActionFragment
    }
  }

`,
  [ActionFragment]
);

/**
 * Props interface for action detail components
 */
export interface ActionDetailProps {
  /** Action ID to fetch details for */
  id: string;
}

/**
 * Fetches and processes a single action's details
 *
 * @param params - Object containing the action ID
 * @returns Normalized action details or null if not found
 */
export const getActionDetail = withTracing(
  "queries",
  "getActionDetail",
  cache(async ({ id }: ActionDetailProps) => {
    "use cache";
    cacheTag("actions");

    const result = await theGraphClientKit.request(
      ActionDetail,
      { id },
      {
        "X-GraphQL-Operation-Name": "ActionDetail",
        "X-GraphQL-Operation-Type": "query",
      }
    );

    if (!result.action) {
      return null;
    }

    return safeParse(ActionSchema, result.action);
  })
);
