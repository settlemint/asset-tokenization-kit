import { user } from "@/lib/db/schema";
import { portalClient, portalGraphql } from "@/lib/settlemint/portal";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm/sql";

const REMOVE_PINCODE_MUTATION = portalGraphql(`
  mutation RemovePinCode($address: String!, $verificationId: String!) {
    deleteWalletVerification(
      userWalletAddress: $address
      verificationId: $verificationId
    ) {
      success
    }
  }
`);

export const remove = authRouter.user.pincode.remove
  .use(databaseMiddleware)
  .handler(async function ({ context: { auth, db }, errors }) {
    const { pincodeEnabled, pincodeVerificationId, wallet } = auth.user;

    if (!pincodeEnabled || !pincodeVerificationId) {
      throw errors.CONFLICT({
        message: "Pincode already removed",
      });
    }

    if (!wallet) {
      throw errors.NOT_FOUND({
        message: "User wallet not found",
      });
    }

    const result = await portalClient.request(REMOVE_PINCODE_MUTATION, {
      address: wallet,
      verificationId: pincodeVerificationId,
    });

    if (!result.deleteWalletVerification?.success) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to delete wallet verification",
      });
    }

    await db
      .update(user)
      .set({
        pincodeEnabled: false,
        pincodeVerificationId: null,
      })
      .where(eq(user.id, auth.user.id));

    return {
      success: true,
    };
  });
