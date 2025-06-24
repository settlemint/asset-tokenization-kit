import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { userClaimsMiddleware } from "@/orpc/middlewares/system/user-claims.middleware";
import { baseRouter } from "@/orpc/procedures/base.router";

export const tokenRouter = baseRouter
  .use(userClaimsMiddleware)
  .use(tokenMiddleware);
