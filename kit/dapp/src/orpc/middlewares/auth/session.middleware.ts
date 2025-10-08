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
import { eq, inArray } from "drizzle-orm";
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

  if (apiKeySecret) {
    const apiKeyAuth = await resolveApiKeySession(apiKeySecret);

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
  secret: string
): Promise<{ user: SessionUser; session: Session } | undefined> {
  const hashed = hashApiKey(secret);

  const apiKeyRecord = await db.query.apikey.findFirst({
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

  const metadata = parseApiKeyMetadata(apiKeyRecord.metadata);
  const impersonatedUserId =
    metadata.impersonatedUserId ?? apiKeyRecord.userId;

  const userIds = new Set<string>();
  userIds.add(apiKeyRecord.userId);
  if (impersonatedUserId) {
    userIds.add(impersonatedUserId);
  }

  const users = userIds.size
    ? await db
        .select()
        .from(authSchema.user)
        .where(inArray(authSchema.user.id, Array.from(userIds)))
    : [];

  const userMap = new Map(users.map((user) => [user.id, user]));

  const impersonatedUser = impersonatedUserId
    ? userMap.get(impersonatedUserId)
    : undefined;

  if (!impersonatedUser) {
    return undefined;
  }

  const sessionUser = {
    ...impersonatedUser,
    wallet: (impersonatedUser.wallet ?? zeroAddress) as EthereumAddress,
    role: (impersonatedUser.role ?? "user") as UserRole,
  } as SessionUser;

  const now = new Date();

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
    userId: impersonatedUser.id,
    expiresAt:
      apiKeyRecord.expiresAt ?? new Date(now.getTime() + 1000 * 60 * 60 * 24),
    token: hashed,
    createdAt: apiKeyRecord.createdAt,
    updatedAt: now,
    ipAddress: null,
    userAgent: "api-key",
    impersonatedBy: apiKeyRecord.userId,
  } as unknown as Session;

  return {
    user: sessionUser,
    session: sessionData,
  };
}
