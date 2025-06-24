import { baseRouter } from "@/orpc/procedures/base.router";

export const walletMiddleware = baseRouter.middleware(
  async ({ context, next, errors }) => {
    // Check if valid authentication context exists
    if (context.auth?.user.wallet) {
      // Authentication is valid, proceed with the authenticated context
      return next();
    }

    // No valid authentication found, reject the request
    throw errors.NOT_ONBOARDED();
  }
);
