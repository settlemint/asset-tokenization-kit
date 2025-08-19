import { portalMiddleware } from "@/middlewares/services/portal.middleware";
import { theGraphMiddleware } from "@/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/middlewares/system/system.middleware";
import { onboardedRouter } from "./onboarded.router";

/**
 * Portal router
 *
 * @description
 * This router is used to handle requests that require a portal client and system.
 */
export const portalRouter = onboardedRouter.use(theGraphMiddleware).use(portalMiddleware).use(systemMiddleware);
