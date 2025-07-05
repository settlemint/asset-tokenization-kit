import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { TokenSchema } from "@/orpc/routes/token/routes/token.read.schema";
import type { z } from "zod/v4";

export const read = authRouter.token.read
  .use(tokenMiddleware)
  .handler(({ context }): z.infer<typeof TokenSchema> => {
    // Transform the token data to match the contract output schema
    // The middleware returns totalSupply as string, but the contract expects Dnum
    return TokenSchema.parse(context.token);
  });
