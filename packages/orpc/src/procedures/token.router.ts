import { tokenMiddleware } from "../middlewares/system/token.middleware";
import { userClaimsMiddleware } from "../middlewares/system/user-claims.middleware";
import { portalRouter } from "./portal.router";

export const tokenRouter = portalRouter
  .use(userClaimsMiddleware)
  .use(tokenMiddleware);
