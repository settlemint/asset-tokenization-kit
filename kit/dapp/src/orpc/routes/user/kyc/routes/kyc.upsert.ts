import { kycProfiles } from "@/lib/db/schema";
import { offChainPermissionsMiddleware } from "@/orpc/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { UserIdSchema } from "@/orpc/routes/user/kyc/kyc.schema";
import { generateId } from "better-auth";
import { sql } from "drizzle-orm";
import { encryptData } from "../kyc.utils";

export const upsert = authRouter.user.kyc.upsert
  .use(
    offChainPermissionsMiddleware<typeof UserIdSchema>({
      requiredPermissions: { kyc: ["upsert"] },
      alwaysAllowIf: (context, input) => input.userId === context.auth?.user.id,
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { userId, id, nationalId, ...profileData } = input;

    // Prepare values for upsert
    const values: typeof kycProfiles.$inferInsert = {
      ...profileData,
      userId,
      id: id ?? generateId(),
      nationalIdEncrypted: "",
    };

    // Encrypt national ID if provided
    if (nationalId) {
      try {
        values.nationalIdEncrypted = await encryptData(nationalId);
      } catch {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Failed to encrypt sensitive data. Please try again.",
        });
      }
    }

    // Use PostgreSQL's INSERT ... ON CONFLICT for atomic upsert within a transaction
    const profile = await context.db.transaction(async (tx) => {
      const [result] = await tx
        .insert(kycProfiles)
        .values(values)
        .onConflictDoUpdate({
          target: kycProfiles.userId,
          set: {
            ...profileData,
            ...(nationalId && {
              nationalIdEncrypted: values.nationalIdEncrypted,
            }),
            updatedAt: sql`now()`,
          },
        })
        .returning();

      if (!result) {
        throw errors.INTERNAL_SERVER_ERROR({
          message:
            "Failed to save KYC profile. Please check your data and try again.",
        });
      }

      return result;
    });

    return {
      ...profile,
      nationalIdEncrypted: undefined,
      hasNationalId: !!profile.nationalIdEncrypted,
      message: context.t("user:kyc.actions.upsert.success"),
    };
  });
