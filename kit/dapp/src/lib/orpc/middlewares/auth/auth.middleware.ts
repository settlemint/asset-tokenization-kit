import { br } from "../../routes/procedures/base.router";

export const auth = br.middleware(async ({ context, next, errors }) => {
  if (context.auth) {
    return next({
      context: {
        auth: context.auth,
      },
    });
  }

  throw errors.UNAUTHORIZED();
});
