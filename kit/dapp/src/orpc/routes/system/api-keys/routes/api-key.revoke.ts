import * as authSchema from "@/lib/auth/db/auth";
import {
  ApiKeyRevokeInputSchema,
  ApiKeyRevokeResultSchema,
} from "@/orpc/routes/system/api-keys/routes/api-key.schemas";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

export const apiKeyRevoke = authRouter.system.apiKeys.revoke
  .use(databaseMiddleware)
  .input(ApiKeyRevokeInputSchema)
  .output(ApiKeyRevokeResultSchema)
  .handler(async ({ context, input, errors }) => {
    const user = context.auth?.user;

    if (!user || user.role !== "admin") {
      throw errors.USER_NOT_AUTHORIZED({
        data: {
          requiredRoles: ["admin"],
        },
      });
    }

    const [updated] = await context.db
      .update(authSchema.apikey)
      .set({
        enabled: false,
        updatedAt: new Date(),
      })
      .where(eq(authSchema.apikey.id, input.id))
      .returning();

    if (!updated) {
      throw errors.NOT_FOUND({
        message: `API key with id ${input.id} was not found`,
      });
    }

    return { success: true };
  });
