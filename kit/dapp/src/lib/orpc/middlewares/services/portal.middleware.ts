import { br } from "@/lib/orpc/routes/procedures/base.router";
import { portalClient } from "@/lib/settlemint/portal";

/**
 * ORPC middleware that injects the SettleMint Portal client into the procedure context.
 *
 * This middleware enables procedures to interact with the SettleMint Portal API,
 * providing access to platform-level services such as deployments, networks, and configurations.
 *
 * @remarks
 * - Uses dependency injection pattern to allow overriding in tests
 * - Falls back to the default portalClient if none provided in context
 * - Required for procedures that interact with SettleMint platform features
 *
 * @example
 * ```typescript
 * const deploymentProcedure = pr
 *   .use(portalMiddleware)
 *   .query(async ({ context }) => {
 *     // context.portalClient is now available
 *     const deployments = await context.portalClient.getDeployments();
 *   });
 * ```
 */
export const portalMiddleware = br.middleware(async ({ context, next }) => {
  return next({
    context: {
      // Use existing Portal client if available (e.g., for testing),
      // otherwise inject the default Portal client instance
      portalClient: context.portalClient ?? portalClient,
    },
  });
});
