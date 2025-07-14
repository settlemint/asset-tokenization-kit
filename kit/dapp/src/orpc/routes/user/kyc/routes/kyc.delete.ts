import { kycProfiles } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

export const remove = authRouter.user.kyc.remove
  // .use(permissionsMiddleware({ user: ["list"] }))
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { userId } = input;

    // Check if user is accessing their own data or is an admin
    if (context.auth.user.id !== userId && context.auth.user.role !== "admin") {
      throw errors.FORBIDDEN({
        message:
          "Access denied. You do not have permission to delete this KYC profile.",
      });
    }

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
