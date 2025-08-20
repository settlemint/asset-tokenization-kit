import { user } from "@/lib/db/schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

const SET_PINCODE_MUTATION = portalGraphql(`
  mutation SetPinCode($address: String!, $pincode: String!) {
    createWalletVerification(
      userWalletAddress: $address
      verificationInfo: {pincode: {name: "PINCODE", pincode: $pincode}}
    ) {
      id
      name
      parameters
      verificationType
    }
  }
`);

export const set = authRouter.user.pincode.set
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db }, input, errors }) {
    const { pincodeEnabled, pincodeVerificationId, wallet } = auth.user;

    if (pincodeEnabled && pincodeVerificationId) {
      throw errors.CONFLICT({
        message: "Pincode already set",
      });
    }

    if (!wallet) {
      throw errors.NOT_FOUND({
        message: "User wallet not found",
      });
    }

    const result = await portalClient.request(SET_PINCODE_MUTATION, {
      address: wallet,
      pincode: input.pincode,
    });

    if (!result.createWalletVerification?.id) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create wallet verification",
      });
    }

    await db
      .update(user)
      .set({
        pincodeEnabled: true,
        pincodeVerificationId: result.createWalletVerification.id,
      })
      .where(eq(user.id, auth.user.id));

    return {
      success: true,
      verificationId: result.createWalletVerification.id,
    };
  });
