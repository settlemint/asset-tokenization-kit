import { auth, type Session, type SessionUser } from "@/lib/auth";
import * as authSchema from "@/lib/auth/db/auth";
import {
  hashApiKey,
  parseApiKeyMetadata,
} from "@/lib/auth/utils/api-keys";
import { db } from "@/lib/db";
import type { Context } from "@/orpc/context/context";
import { baseRouter } from "@/orpc/procedures/base.router";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import type { UserRole } from "@atk/zod/user-roles";
import { eq } from "drizzle-orm";
import { zeroAddress } from "viem";

/**
 * Session middleware for optional authentication context.
 *
 * This middleware loads authentication session data into the request context
 * without enforcing authentication requirements. It provides optional session
 * information that can be used by procedures to customize behavior for
 * authenticated vs unauthenticated users.
 *
 * The middleware:
 * - Checks if auth context already exists (from previous middleware)
 * - If not present, attempts to load session from request headers
 * - Always succeeds, even if no valid session is found
 * - Populates context.auth with session data or undefined
 *
 * This is typically used in public routers where authentication is optional
 * but beneficial when available (e.g., personalized content, user preferences).
 * @example
 * ```typescript
 * // Used in public router
 * export const pr = baseRouter.use(errorMiddleware).use(sessionMiddleware);
 *
 * // In a procedure handler
 * export const getContent = pr.content.get.handler(async ({ context }) => {
 *   if (context.auth?.user) {
 *     // Return personalized content for authenticated users
 *     return getPersonalizedContent(context.auth.user.id);
 *   }
 *   // Return generic content for unauthenticated users
 *   return getPublicContent();
 * });
 * ```
 * @see {@link ./auth.middleware} - Strict authentication middleware
 * @see {@link @/lib/auth/auth} - Authentication system
 */
export const sessionMiddleware = baseRouter.middleware<
  Required<Pick<Context, "auth">>,
  unknown
>(async ({ context, next }) => {
  if (context.auth) {
    return next({
      context: {
        auth: context.auth,
      },
    });
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(context.headers)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        headers.append(key, item);
      });
      continue;
    }

    headers.append(key, value);
  }

  const session = await auth.api.getSession({
    headers,
  });

  if (session?.user) {
    return next({
      context: {
        auth: {
          user: session.user as SessionUser,
          session: session as Session,
        },
      },
    });
  }

  const apiKeySecret = headers.get("x-api-key") ?? headers.get("X-Api-Key");
  const impersonatedUserIdHeader =
    headers.get("x-api-user-id") ??
    headers.get("X-Api-User-Id") ??
    headers.get("x-user-id") ??
    headers.get("X-User-Id");

  if (apiKeySecret) {
    const apiKeyAuth = await resolveApiKeySession(
      apiKeySecret,
      impersonatedUserIdHeader ?? undefined
    );

    if (apiKeyAuth) {
      return next({
        context: {
          auth: apiKeyAuth,
        },
      });
    }
  }

  return next({
    context: {
      auth: undefined,
    },
  });
});

async function resolveApiKeySession(
  secret: string,
  requestedUserId?: string
): Promise<{ user: SessionUser; session: Session } | undefined> {
  const verifyResult = await (auth.apiKeys as unknown as {
    verifyApiKey: (payload: Record<string, unknown>) => Promise<{
      data?: Record<string, any> | null;
      error?: { message?: string } | null;
    }>;
  }).verifyApiKey({ apiKey: secret });

  if (!verifyResult || verifyResult.error) {
    return undefined;
  }

  const hashed = hashApiKey(secret);
  const verifiedData = verifyResult.data ?? {};
  const verifiedId =
    verifiedData?.apiKey?.id ?? verifiedData?.id ?? verifiedData?.key?.id;

  const apiKeyRecord = verifiedId
    ? await db.query.apikey.findFirst({
        where: eq(authSchema.apikey.id, verifiedId),
      })
    : await db.query.apikey.findFirst({
        where: eq(authSchema.apikey.key, hashed),
      });

  if (!apiKeyRecord) {
    return undefined;
  }

  if (apiKeyRecord.enabled === false) {
    return undefined;
  }

  if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt.getTime() < Date.now()) {
    return undefined;
  }

  if (!requestedUserId) {
    return undefined;
  }

  const targetUser = await db.query.user.findFirst({
    where: eq(authSchema.user.id, requestedUserId),
  });

  if (!targetUser) {
    return undefined;
  }

  const sessionUser = {
    ...targetUser,
    wallet: (targetUser.wallet ?? zeroAddress) as EthereumAddress,
    role: (targetUser.role ?? "user") as UserRole,
  } as SessionUser;

  const now = new Date();

  const metadata = parseApiKeyMetadata(apiKeyRecord.metadata);

  await db
    .update(authSchema.apikey)
    .set({
      lastRequest: now,
      requestCount: (apiKeyRecord.requestCount ?? 0) + 1,
      updatedAt: now,
    })
    .where(eq(authSchema.apikey.id, apiKeyRecord.id));

  const sessionData = {
    id: `api-key:${apiKeyRecord.id}`,
    userId: targetUser.id,
    expiresAt:
      apiKeyRecord.expiresAt ?? new Date(now.getTime() + 1000 * 60 * 60 * 24),
    token: hashed,
    createdAt: apiKeyRecord.createdAt,
    updatedAt: now,
    ipAddress: null,
    userAgent: "api-key",
    impersonatedBy: metadata.createdByUserId ?? apiKeyRecord.userId,
  } as unknown as Session;

  return {
    user: sessionUser,
    session: sessionData,
  };
}
