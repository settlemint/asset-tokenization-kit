import { kycProfiles } from "@/lib/db/schema";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { SYSTEM_PERMISSIONS } from "@/orpc/routes/system/system.permissions";
import { eq } from "drizzle-orm";
import { KycReadInputSchema } from "./kyc.read.schema";

export const read = authRouter.user.kyc.read
  .use(systemMiddleware)
  .use(
    blockchainPermissionsMiddleware<typeof KycReadInputSchema>({
      requiredRoles: SYSTEM_PERMISSIONS.kycRead,
      getAccessControl: ({ context }) => {
        return context.system?.systemAccessManager?.accessControl;
      },
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

    return profile;
  });
