import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";

/**
 * Portal router
 *
 * @description
 * This router is used to handle requests that require a portal client and system.
 */
export const systemRouter = onboardedRouter.use(systemMiddleware);
