import { auth } from "@/lib/auth/auth";
import { br } from "@/lib/orpc/routes/procedures/base.router";

export const session = br.middleware(async ({ context, next }) => {
  return next({
    context: {
      auth:
        context.auth ??
        (await auth.api.getSession({
          headers: context.headers,
        })),
    },
  });
});
