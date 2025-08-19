import { kycProfiles } from "@atk/db/schemas/kyc";
import { generateId } from "better-auth";
import { sql } from "drizzle-orm";
import { offChainPermissionsMiddleware } from "@/middlewares/auth/offchain-permissions.middleware";
import { databaseMiddleware } from "@/middlewares/services/db.middleware";
import { authRouter } from "@/procedures/auth.router";
import type { KycUpsertInputSchema } from "@/routes/user/kyc/routes/kyc.upsert.schema";

export const upsert = authRouter.user.kyc.upsert
  .use(
    offChainPermissionsMiddleware<typeof KycUpsertInputSchema>({
      requiredPermissions: { kyc: ["upsert"] },
      alwaysAllowIf: (context, input) => input.userId === context.auth?.user.id,
    })
  )
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { userId, id, ...profileData } = input;

    // Prepare values for upsert
    const values: typeof kycProfiles.$inferInsert = {
      ...profileData,
      userId,
      id: id ?? generateId(),
    };

    // Use PostgreSQL's INSERT ... ON CONFLICT for atomic upsert within a transaction
    const profile = await context.db.transaction(async (tx) => {
      const [result] = await tx
        .insert(kycProfiles)
        .values(values)
        .onConflictDoUpdate({
          target: kycProfiles.userId,
          set: {
            ...profileData,
            updatedAt: sql`now()`,
          },
        })
        .returning();

      if (!result) {
        throw errors.INTERNAL_SERVER_ERROR({
          message: "Failed to save KYC profile. Please check your data and try again.",
        });
      }

      return result;
    });

    return profile;
  });
