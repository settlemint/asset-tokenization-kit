import { createWallet as createWalletLib } from "@/lib/auth/wallet";
import { user } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

export const createWallet = authRouter.user.createWallet
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db }, errors }) {
    if (auth.user.wallet !== "0x0000000000000000000000000000000000000000") {
      throw errors.CONFLICT({
        message: "Wallet already created",
      });
    }

    const wallet = await createWalletLib(auth.user.id);

    await db
      .update(user)
      .set({
        wallet: wallet,
      })
      .where(eq(user.id, auth.user.id));

    return { wallet };
  });
