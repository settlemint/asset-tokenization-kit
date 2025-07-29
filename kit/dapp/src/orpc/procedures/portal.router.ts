import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";

/**
 * Portal router
 *
 * @description
 * This router is used to handle requrests that require a portal client and system.
 */
export const portalRouter = onboardedRouter
  .use(theGraphMiddleware)
  .use(portalMiddleware)
  .use(systemMiddleware);
