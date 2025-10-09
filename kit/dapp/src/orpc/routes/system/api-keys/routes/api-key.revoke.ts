import * as authSchema from "@/lib/auth/db/auth";
import { auth } from "@/lib/auth";
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

    const existing = await context.db.query.apikey.findFirst({
      where: eq(authSchema.apikey.id, input.id),
    });

    if (!existing) {
      throw errors.NOT_FOUND({
        message: `API key with id ${input.id} was not found`,
      });
    }

    const deleteResult = await (auth.apiKeys as unknown as {
      deleteKey: (payload: Record<string, unknown>) => Promise<{
        data?: Record<string, any> | null;
        error?: { message?: string } | null;
      }>;
    }).deleteKey({ id: input.id });

    if (!deleteResult || deleteResult.error) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: deleteResult?.error?.message ?? "Failed to revoke API key",
      });
    }

    return { success: true };
  });
