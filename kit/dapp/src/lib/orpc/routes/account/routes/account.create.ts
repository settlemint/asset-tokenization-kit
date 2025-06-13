import { env } from "@/lib/config/env";
import { portalMiddleware } from "@/lib/orpc/middlewares/services/portal.middleware";
import { ar } from "@/lib/orpc/procedures/auth.router";
import { portalGraphql } from "@/lib/settlemint/portal";
import { ORPCError } from "@orpc/client";

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
  .use(portalMiddleware)
  .handler(async ({ context }) => {
    const sender = context.auth.user;

    const { createWallet } = await context.portalClient.request(
      CREATE_ACCOUNT_MUTATION,
      {
        userId: sender.id,
        keyVaultId: env.SETTLEMINT_HD_PRIVATE_KEY,
      }
    );

    if (!createWallet?.address) {
      throw new ORPCError("Failed to create wallet");
    }

    return {
      id: createWallet.address,
      identity: null,
    };
  });
