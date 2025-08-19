import { createWallet as createWalletLib } from "@atk/auth/utils/wallet";
import { user } from "@atk/db/schemas/auth";
import { databaseMiddleware } from "../../../../middlewares/services/db.middleware";
import { authRouter } from "../../../../procedures/auth.router";
import { eq } from "drizzle-orm";
import { zeroAddress } from "viem";

export const createWallet = authRouter.user.createWallet
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db }, errors }) {
    if (auth.user.wallet !== zeroAddress) {
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

    return {
      wallet,
    };
  });
