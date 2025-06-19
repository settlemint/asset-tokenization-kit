import { user } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";
import { AccountCreateMessagesSchema } from "./account.create.schema";

const CREATE_ACCOUNT_MUTATION = portalGraphql(`
  mutation CreateAccountMutation($keyVaultId: String!, $userId: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: {name: $userId}) {
      address
    }
  }
`);

export const create = authRouter.account.create
  .use(databaseMiddleware)
  .use(portalMiddleware)
  .handler(async ({ input, context, errors }) => {
    const sender = context.auth.user;
    
    // Parse messages with defaults using Zod schema
    const messages = AccountCreateMessagesSchema.parse(input.messages ?? {});

    if (sender.wallet) {
      // 409 Conflict is more appropriate for "resource already exists"
      throw errors.RESOURCE_ALREADY_EXISTS({
        message: messages.walletAlreadyExists,
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
        message: messages.walletCreationFailed,
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
        wallet: createWallet.address,
      })
      .where(eq(user.id, sender.id));

    return createWallet.address;
  });
