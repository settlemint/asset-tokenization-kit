import { kycProfiles } from "@atk/db/schemas/kyc";
import { offChainPermissionsMiddleware } from "../../../../middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "../../../../middlewares/services/db.middleware";
import { authRouter } from "../../../../procedures/auth.router";
import { eq } from "drizzle-orm";
import { KycReadInputSchema } from "./kyc.read.schema";

export const read = authRouter.user.kyc.read
  .use(
    offChainPermissionsMiddleware<typeof KycReadInputSchema>({
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

    return profile;
  });
