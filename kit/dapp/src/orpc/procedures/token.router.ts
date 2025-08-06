import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { userClaimsMiddleware } from "@/orpc/middlewares/system/user-claims.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";

export const tokenRouter = portalRouter
  .use(userClaimsMiddleware)
  .use(tokenMiddleware);
