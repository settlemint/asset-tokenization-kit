import { isOnboarded } from "@/lib/auth/plugins/utils";
import { baseRouter } from "@/orpc/procedures/base.router";
import { zeroAddress } from "viem";

export const walletMiddleware = baseRouter.middleware(
  async ({ context, next, errors }) => {
    // Check if valid authentication context exists
    if (
      context.auth?.user &&
      context.auth?.user.wallet !== zeroAddress &&
      isOnboarded(context.auth.user)
    ) {
      // Authentication is valid, proceed with the authenticated context
      return next();
    }

    // No valid authentication found, reject the request
    throw errors.NOT_ONBOARDED();
  }
);
