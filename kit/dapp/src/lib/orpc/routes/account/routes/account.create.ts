import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/config/env";
import { user } from "@/lib/db/schema-auth";
import { databaseMiddleware } from "@/lib/orpc/middlewares/services/db.middleware";
import { portalMiddleware } from "@/lib/orpc/middlewares/services/portal.middleware";
import { ar } from "@/lib/orpc/procedures/auth.router";
import { portalGraphql } from "@/lib/settlemint/portal";
import { eq } from "drizzle-orm";

const CREATE_ACCOUNT_MUTATION = portalGraphql(`
  mutation CreateAccountMutation($keyVaultId: String!, $userId: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: {name: $userId}) {
      address
    }
  }
`);

export const create = ar.account.create
  // TODO JAN: add permissions middleware, needs the default user role in better auth
  // .use(
  //   permissionsMiddleware({
  //     requiredPermissions: ["create"],
  //     roles: ["admin"],
  //   })
  // )
  .use(databaseMiddleware)
  .use(portalMiddleware)
  .handler(async ({ context, errors }) => {
    const sender = context.auth.user;

    if (sender.walletAddress) {
      // 409 Conflict is more appropriate for "resource already exists"
      throw errors.CONFLICT({
        message: "Wallet already created for this user",
      });
    }

    // TODO JAN: i can call this twice for the same id, is that normal?
    const { createWallet } = await context.portalClient.request(
      CREATE_ACCOUNT_MUTATION,
      {
        userId: sender.id,
        keyVaultId: env.SETTLEMINT_HD_PRIVATE_KEY,
      }
    );

    if (!createWallet?.address) {
      throw errors.PORTAL_ERROR({
        data: {
          operation: "createWallet",
          details: "Failed to create wallet in portal service",
        },
      });
    }

    // Set the wallet address in the database
    await context.db
      .update(user)
      .set({
        walletAddress: createWallet.address,
      })
      .where(eq(user.id, sender.id));

    // Refresh the cookie cache
    await auth.api.getSession({
      headers: context.headers,
      query: {
        disableCookieCache: true,
      },
    });

    return createWallet.address;
  });
