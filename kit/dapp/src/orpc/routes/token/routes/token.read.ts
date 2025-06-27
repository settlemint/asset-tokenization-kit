import { tokenMiddleware } from '@/orpc/middlewares/system/token.middleware';
import { authRouter } from '@/orpc/procedures/auth.router';
import { TokenSchema } from '@/orpc/routes/token/routes/token.read.schema';

export const read = authRouter.token.read
  .use(tokenMiddleware)
  .handler(({ context }) => {
    return TokenSchema.parse(context.token);
  });
