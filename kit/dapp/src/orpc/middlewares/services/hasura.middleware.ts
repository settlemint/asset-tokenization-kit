import { hasuraClient } from "@/lib/settlemint/hasura";
import type { Context } from "@/orpc/context/context";
import { baseRouter } from "../../procedures/base.router";

/**
 * ORPC middleware that injects the Hasura GraphQL client into the procedure context.
 *
 * This middleware ensures that all procedures have access to the Hasura client
 * for executing GraphQL queries and mutations against the Hasura endpoint.
 * @remarks
 * - Uses dependency injection pattern to allow overriding in tests
 * - Falls back to the default hasuraClient if none provided in context
 * - Essential for procedures that need to interact with Hasura's GraphQL API
 * @example
 * ```typescript
 * const myProcedure = pr
 *   .use(hasuraMiddleware)
 *   .query(async ({ context }) => {
 *     // context.hasuraClient is now available
 *     const result = await context.hasuraClient.query({...});
 *   });
 * ```
 */
export const hasuraMiddleware = baseRouter.middleware<
  Required<Pick<Context, "hasuraClient">>,
  unknown
>(async ({ context, next }) => {
  return next({
    context: {
      // Use existing Hasura client if available (e.g., for testing),
      // otherwise inject the default Hasura client instance
      hasuraClient: context.hasuraClient ?? hasuraClient,
    },
  });
});
