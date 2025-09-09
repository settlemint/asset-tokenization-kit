import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { userIdentityMiddleware } from "@/orpc/middlewares/system/user-identity.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";

export const tokenRouter = systemRouter
  .use(userIdentityMiddleware)
  .use(tokenMiddleware);
