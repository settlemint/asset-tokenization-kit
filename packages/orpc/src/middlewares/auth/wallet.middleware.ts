import { isOnboarded } from "@atk/auth/plugins/utils";
import { zeroAddress } from "viem";
import { baseRouter } from "@/procedures/base.router";

export const walletMiddleware = baseRouter.middleware(({ context, next, errors }) => {
  // Check if valid authentication context exists
  if (context.auth?.user && context.auth?.user.wallet !== zeroAddress && isOnboarded(context.auth.user)) {
    // Authentication is valid, proceed with the authenticated context
    return next();
  }

  // No valid authentication found, reject the request
  throw errors.NOT_ONBOARDED();
});
