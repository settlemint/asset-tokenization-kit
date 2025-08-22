import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";

/**
 * System router
 *
 * Router for requests that require system middleware and an onboarded user.
 */
export const systemRouter = onboardedRouter.use(systemMiddleware);
