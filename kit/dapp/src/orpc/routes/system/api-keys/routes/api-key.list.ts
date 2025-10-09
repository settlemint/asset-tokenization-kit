import * as authSchema from "@/lib/auth/db/auth";
import { parseApiKeyMetadata } from "@/lib/auth/utils/api-keys";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { inArray } from "drizzle-orm";
import { desc } from "drizzle-orm/sql";

export const apiKeyList = authRouter.system.apiKeys.list
  .use(databaseMiddleware)
  .handler(async ({ context, errors }) => {
    const user = context.auth?.user;

    if (!user || user.role !== "admin") {
      throw errors.USER_NOT_AUTHORIZED({
        data: {
          requiredRoles: ["admin"],
        },
      });
    }

    const apiKeys = await context.db
      .select()
      .from(authSchema.apikey)
      .orderBy(desc(authSchema.apikey.createdAt));

    const metadataById = new Map(
      apiKeys.map((key) => [key.id, parseApiKeyMetadata(key.metadata)])
    );

    const ownerIds = apiKeys.map((key) => key.userId);
    const uniqueIds = Array.from(new Set(ownerIds));

    const users = uniqueIds.length
      ? await context.db
          .select()
          .from(authSchema.user)
          .where(inArray(authSchema.user.id, uniqueIds))
      : [];

    const userMap = new Map(users.map((item) => [item.id, item]));

    return apiKeys.map((key) => {
      const metadata = metadataById.get(key.id) ?? {};
      const ownerUser = userMap.get(key.userId);

      return {
        id: key.id,
        name: key.name,
        prefix: key.prefix,
        start: key.start,
        enabled: key.enabled ?? true,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
        expiresAt: key.expiresAt,
        lastUsedAt: key.lastRequest,
        description: metadata.description ?? null,
        owner: ownerUser
          ? {
              id: ownerUser.id,
              email: ownerUser.email,
              name: ownerUser.name,
            }
          : null,
      };
    });
  });
