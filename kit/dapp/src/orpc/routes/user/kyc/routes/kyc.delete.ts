import { kycProfiles } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { UserIdSchema } from "@/orpc/routes/user/kyc/kyc.schema";
import { eq } from "drizzle-orm";

export const remove = authRouter.user.kyc.remove
  .use(
    offChainPermissionsMiddleware<typeof UserIdSchema>({
      requiredPermissions: { kyc: ["remove"] },
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

    return {
      ...deleted,
      message: context.t("user:kyc.actions.delete.success"),
    };
  });
