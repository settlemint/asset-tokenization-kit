import { kycProfiles, user } from "@/lib/db/schema";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { theGraphMiddleware } from "@/orpc/middlewares/services/the-graph.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { fetchUserIdentity } from "@/orpc/routes/user/utils/identity.util";
import {
  buildUserWithIdentity,
  buildUserWithoutWallet,
} from "@/orpc/routes/user/utils/user-response.util";
import { eq } from "drizzle-orm";

/**
 * User read by ID route handler.
 */
export const readByUserId = authRouter.user.readByUserId
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.userRead,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const result = await context.db
      .select({
        user: user,
        kyc: {
          firstName: kycProfiles.firstName,
          lastName: kycProfiles.lastName,
        },
      })
      .from(user)
      .leftJoin(kycProfiles, eq(kycProfiles.userId, user.id))
      .where(eq(user.id, input.userId))
      .limit(1);

    if (result.length === 0) {
      throw errors.NOT_FOUND({
        message: `User with ID ${input.userId} not found`,
      });
    }

    const userResult = result[0];
    if (!userResult) {
      throw errors.NOT_FOUND({
        message: `User with ID ${input.userId} not found`,
      });
    }

    const { user: userData, kyc } = userResult;

    if (!userData.wallet) {
      return buildUserWithoutWallet({
        userData,
        kyc,
        context,
      });
    }

    const identityResult = await fetchUserIdentity({
      wallet: userData.wallet,
      context,
    });

    return buildUserWithIdentity({
      userData,
      kyc,
      identity: identityResult.identity,
      claims: identityResult.claims,
      isRegistered: identityResult.isRegistered,
      context,
    });
  });

/**
 * User read by wallet route handler.
 */
export const readByWallet = authRouter.user.readByWallet
  .use(systemMiddleware)
  .use(theGraphMiddleware)
  .use(
    blockchainPermissionsMiddleware({
      requiredRoles: SYSTEM_PERMISSIONS.userRead,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const result = await context.db
      .select({
        user: user,
        kyc: {
          firstName: kycProfiles.firstName,
          lastName: kycProfiles.lastName,
        },
      })
      .from(user)
      .leftJoin(kycProfiles, eq(kycProfiles.userId, user.id))
      .where(eq(user.wallet, input.wallet as `0x${string}`))
      .limit(1);

    if (result.length === 0) {
      throw errors.NOT_FOUND({
        message: `User with wallet ${input.wallet} not found`,
      });
    }

    const userResult = result[0];
    if (!userResult) {
      throw errors.NOT_FOUND({
        message: `User with wallet ${input.wallet} not found`,
      });
    }

    const { user: userData, kyc } = userResult;

    if (!userData.wallet) {
      return buildUserWithoutWallet({
        userData,
        kyc,
        context,
      });
    }

    const identityResult = await fetchUserIdentity({
      wallet: userData.wallet,
      context,
    });

    return buildUserWithIdentity({
      userData,
      kyc,
      identity: identityResult.identity,
      claims: identityResult.claims,
      isRegistered: identityResult.isRegistered,
      context,
    });
  });
