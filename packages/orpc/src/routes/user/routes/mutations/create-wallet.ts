import { createWallet as createWalletLib } from "@atk/auth/utils/wallet";
import { user } from "@atk/db/schemas/auth";
import { eq } from "drizzle-orm";
import { zeroAddress } from "viem";
import { databaseMiddleware } from "@/middlewares/services/db.middleware";
import { authRouter } from "@/procedures/auth.router";

export const createWallet = authRouter.user.createWallet
  .use(databaseMiddleware)
  .handler(async ({ context: { auth, db }, errors }) => {
    if (auth.user.wallet !== zeroAddress) {
      throw errors.CONFLICT({
        message: "Wallet already created",
      });
    }

    const wallet = await createWalletLib(auth.user.id);

    await db
      .update(user)
      .set({
        wallet,
      })
      .where(eq(user.id, auth.user.id));

    return {
      wallet,
    };
  });
