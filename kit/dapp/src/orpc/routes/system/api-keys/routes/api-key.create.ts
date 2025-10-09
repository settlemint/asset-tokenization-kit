import * as authSchema from "@/lib/auth/db/auth";
import {
  ApiKeyCreateInputSchema,
  ApiKeyWithSecretSchema,
} from "@/orpc/routes/system/api-keys/routes/api-key.schemas";
import { parseApiKeyMetadata } from "@/lib/auth/utils/api-keys";
import { databaseMiddleware } from "@/orpc/middlewares/services/db.middleware";
import { authRouter } from "@/orpc/procedures/auth.router";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

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

    const { name, description, expiresAt } = input;

    const metadata = {
      description: description ?? undefined,
      createdByUserId: user.id,
    };

    const createResult = await (auth.apiKeys as unknown as {
      createKey: (payload: Record<string, unknown>) => Promise<{
        data?: Record<string, any> | null;
        error?: { message?: string } | null;
      }>;
    }).createKey({
      userId: user.id,
      name,
      metadata,
      expiresAt: expiresAt ?? undefined,
    });

    if (!createResult || createResult.error) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: createResult?.error?.message ?? "Failed to create API key",
      });
    }

    const createdData = createResult.data ?? {};
    const createdId =
      createdData?.apiKey?.id ?? createdData?.id ?? createdData?.key?.id;

    if (!createdId) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Failed to determine created API key identifier",
      });
    }

    const created = await context.db.query.apikey.findFirst({
      where: eq(authSchema.apikey.id, createdId),
    });

    if (!created) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "API key was created but could not be loaded",
      });
    }

    const parsedMetadata = parseApiKeyMetadata(created.metadata);
    const secret =
      createdData?.secret ??
      createdData?.apiKey?.secret ??
      createdData?.plainTextKey ??
      createdData?.key?.secret;

    if (!secret) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "API key secret was not returned by Better Auth",
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
      description: parsedMetadata.description ?? null,
      owner: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      secret,
    };
  });
