import { pr } from "@/lib/orpc/routes/procedures/public.router";
import type { AuthenticatedContext } from "../context/context";

const requireAuth = pr.middleware(async ({ context, next, errors }) => {
  if (!context.auth?.user) {
    throw errors.UNAUTHORIZED();
  }
  return next({
    context: {
      ...context,
      auth: context.auth,
    } as AuthenticatedContext,
  });
});

export const ar = pr.use(requireAuth);
