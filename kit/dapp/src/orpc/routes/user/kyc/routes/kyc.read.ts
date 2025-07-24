import { kycProfiles } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

export const read = authRouter.user.kyc.read
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { userId } = input;

    // Check if user is accessing their own data or is an admin
    if (context.auth.user.id !== userId && context.auth.user.role !== "admin") {
      throw errors.FORBIDDEN({
        message:
          "Access denied. You do not have permission to view this KYC profile.",
      });
    }

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
