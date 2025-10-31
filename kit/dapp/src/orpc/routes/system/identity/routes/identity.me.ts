import { systemRouter } from "@/orpc/procedures/system.router";
import { identityReadByWallet } from "@/orpc/routes/system/identity/routes/identity.read";
import { call } from "@orpc/server";

/**
 * Identity.me route handler.
 *
 * Returns the authenticated user's identity information by:
 * 1. Using systemMiddleware to get user identity context
 * 2. If no identity found, throws error
 * 3. If identity exists, calls identity.read for full details
 *
 * @auth Required - User must be authenticated and system onboarded
 * @returns Current user's comprehensive identity information
 * @throws NOT_FOUND - If user has no identity in the system
 */
export const identityMe = systemRouter.system.identity.me.handler(
  async ({ context }) => {
    const { auth } = context;

    return await call(
      identityReadByWallet,
      {
        wallet: auth.user.wallet,
      },
      {
        context,
      }
    );
  }
);
