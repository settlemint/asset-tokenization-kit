import { kycProfiles } from "@/lib/db/schema";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { generateId } from "better-auth";
import { sql } from "drizzle-orm";
import { encryptData } from "../kyc.utils";

export const upsert = authRouter.user.kyc.upsert
  // .use(permissionsMiddleware({ user: ["list"] }))
  .use(databaseMiddleware)
  .handler(async ({ context, input, errors }) => {
    const { userId, id, nationalId, ...profileData } = input;

    // Check if user is accessing their own data or is an admin
    if (context.auth.user.id !== userId && context.auth.user.role !== "admin") {
      throw errors.FORBIDDEN({
        message:
          "Access denied. You do not have permission to modify this KYC profile.",
      });
    }

    // Prepare values for upsert
    const values: Record<string, unknown> = {
      ...profileData,
      userId,
      id: id ?? generateId(),
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
        .values(values as typeof kycProfiles.$inferInsert)
        .onConflictDoUpdate({
          target: kycProfiles.userId,
          set: {
            ...profileData,
            ...(nationalId && {
              nationalIdEncrypted: values.nationalIdEncrypted as string,
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
    };
  });
