import { theGraphClient } from "@/lib/settlemint/the-graph";
import { br } from "../../procedures/base.router";

/**
 * ORPC middleware that injects The Graph client into the procedure context.
 *
 * This middleware provides access to The Graph protocol for querying indexed blockchain data,
 * enabling efficient retrieval of on-chain events, transactions, and state changes.
 *
 * @remarks
 * - Uses dependency injection pattern to allow overriding in tests
 * - Falls back to the default theGraphClient if none provided in context
 * - Essential for procedures that need to query historical blockchain data or events
 *
 * @example
 * ```typescript
 * const tokenHistoryProcedure = pr
 *   .use(theGraphMiddleware)
 *   .query(async ({ context, input }) => {
 *     // context.theGraphClient is now available
 *     const transfers = await context.theGraphClient.query({
 *       query: gql`
 *         query GetTransfers($tokenId: ID!) {
 *           transfers(where: { token: $tokenId }) {
 *             id
 *             from
 *             to
 *             value
 *           }
 *         }
 *       `,
 *       variables: { tokenId: input.tokenId }
 *     });
 *   });
 * ```
 */
export const theGraphMiddleware = br.middleware(async ({ context, next }) => {
  return next({
    context: {
      // Use existing Graph client if available (e.g., for testing),
      // otherwise inject the default Graph client instance
      theGraphClient: context.theGraphClient ?? theGraphClient,
    },
  });
});
