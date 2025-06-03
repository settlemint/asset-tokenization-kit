import { br } from "../../routes/procedures/base.router";

export const authMiddleware = br.middleware(
  async ({ context, next, errors }) => {
    if (context.auth) {
      return next({
        context: {
          auth: context.auth,
        },
      });
    }

    throw errors.UNAUTHORIZED();
  }
);
