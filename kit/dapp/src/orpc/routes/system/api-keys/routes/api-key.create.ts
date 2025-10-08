import crypto from "node:crypto";

import * as authSchema from "@/lib/auth/db/auth";
import {
  ApiKeyCreateInputSchema,
  ApiKeyWithSecretSchema,
} from "@/orpc/routes/system/api-keys/routes/api-key.schemas";
import {
  generateApiKeySecret,
  serializeApiKeyMetadata,
} from "@/lib/auth/utils/api-keys";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";

export const apiKeyCreate = authRouter.system.apiKeys.create
  .use(databaseMiddleware)
  .input(ApiKeyCreateInputSchema)
  .output(ApiKeyWithSecretSchema)
  .handler(async ({ context, input, errors }) => {
    const user = context.auth?.user;

    if (!user || user.role !== "admin") {
      throw errors.USER_NOT_AUTHORIZED({
        data: {
          requiredRoles: ["admin"],
        },
      });
    }

    const { name, description, impersonateUserEmail, impersonateUserId, expiresAt } =
      input;

    let impersonatedUserId = impersonateUserId ?? null;

    if (!impersonatedUserId && impersonateUserEmail) {
      const [impersonatedByEmail] = await context.db
        .select()
        .from(authSchema.user)
        .where(eq(authSchema.user.email, impersonateUserEmail.toLowerCase()));

      if (!impersonatedByEmail) {
        throw errors.NOT_FOUND({
          message: `User with email ${impersonateUserEmail} was not found`,
        });
      }

      impersonatedUserId = impersonatedByEmail.id;
    }

    let impersonatedUser = null;

    if (impersonatedUserId) {
      const [foundImpersonated] = await context.db
        .select()
        .from(authSchema.user)
        .where(eq(authSchema.user.id, impersonatedUserId));

      if (!foundImpersonated) {
        throw errors.NOT_FOUND({
          message: `User with id ${impersonatedUserId} was not found`,
        });
      }

      impersonatedUser = foundImpersonated;
    }

    const metadata = serializeApiKeyMetadata({
      impersonatedUserId: impersonatedUser?.id ?? undefined,
      description: description ?? undefined,
      createdByUserId: user.id,
    });

    const generated = generateApiKeySecret();
    const [created] = await context.db
      .insert(authSchema.apikey)
      .values({
        id: crypto.randomUUID(),
        name,
        prefix: generated.prefix,
        start: generated.start,
        key: generated.hashed,
        userId: user.id,
        enabled: true,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: expiresAt ?? null,
      })
      .returning();

    if (!created) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to create API key",
      });
    }

    return {
      id: created.id,
      name: created.name,
      prefix: created.prefix,
      start: created.start,
      enabled: created.enabled ?? true,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
      expiresAt: created.expiresAt,
      lastUsedAt: created.lastRequest,
      description: description ?? null,
      impersonation: impersonatedUser
        ? {
            id: impersonatedUser.id,
            email: impersonatedUser.email,
            name: impersonatedUser.name,
            role: impersonatedUser.role ?? "user",
          }
        : {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
      owner: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      secret: generated.secret,
    };
  });
