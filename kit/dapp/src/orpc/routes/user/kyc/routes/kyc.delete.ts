import { kycProfiles } from "@/lib/db/schema";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { eq } from "drizzle-orm";
import { KycDeleteInputSchema } from "./kyc.delete.schema";

export const remove = authRouter.user.kyc.remove
  .use(systemMiddleware)
  .use(
    blockchainPermissionsMiddleware<typeof KycDeleteInputSchema>({
      requiredRoles: SYSTEM_PERMISSIONS.kycDelete,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
      alwaysAllowIf: (context, input) => input.userId === context.auth?.user.id,
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { userId } = input;

    const [deleted] = await context.db
      .delete(kycProfiles)
      .where(eq(kycProfiles.userId, userId))
      .returning({ userId: kycProfiles.userId });

    if (!deleted) {
      throw errors.NOT_FOUND({
        message:
          "No KYC profile found to delete. The profile may have already been removed.",
      });
    }

    return deleted;
  });
