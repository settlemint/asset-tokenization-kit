import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { userClaimsMiddleware } from "@/orpc/middlewares/system/user-claims.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";

export const tokenRouter = onboardedRouter
  .use(systemMiddleware)
  .use(userClaimsMiddleware)
  .use(tokenMiddleware);
