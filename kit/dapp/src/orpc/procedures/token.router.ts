import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { systemRouter } from "@/orpc/procedures/system.router";

export const tokenRouter = systemRouter
  .use(tokenMiddleware);
