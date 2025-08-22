import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { userClaimsMiddleware } from "@/orpc/middlewares/system/user-claims.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";

export const tokenRouter = systemRouter
  .use(userClaimsMiddleware)
  .use(tokenMiddleware);
