import { kycProfiles } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { UserIdSchema } from "@/orpc/routes/user/kyc/kyc.schema";
import { eq } from "drizzle-orm";

export const read = authRouter.user.kyc.read
  .use(
    offChainPermissionsMiddleware<typeof UserIdSchema>({
      requiredPermissions: { kyc: ["list"] },
      alwaysAllowIf: (context, input) => input.userId === context.auth?.user.id,
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { userId } = input;

    const [profile] = await context.db
      .select()
      .from(kycProfiles)
      .where(eq(kycProfiles.userId, userId))
      .limit(1);

    if (!profile) {
      throw errors.NOT_FOUND({
        message:
          "No KYC profile found. The user may not have completed their KYC verification yet.",
      });
    }

    return {
      ...profile,
      nationalIdEncrypted: undefined,
      hasNationalId: !!profile.nationalIdEncrypted,
    };
  });
