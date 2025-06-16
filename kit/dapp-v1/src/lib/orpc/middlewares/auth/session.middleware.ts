import { auth } from "@/lib/auth/auth";
import type { Session, User } from "@/lib/auth/types";
import { br } from "../../procedures/base.router";

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
 *
 * @example
 * ```typescript
 * // Used in public router
 * export const pr = br.use(errorMiddleware).use(sessionMiddleware);
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
 *
 * @see {@link ./auth.middleware} - Strict authentication middleware
 * @see {@link @/lib/auth/auth} - Authentication system
 */
export const sessionMiddleware = br.middleware(async ({ context, next }) => {
  return next({
    context: {
      // Use existing auth context if available, otherwise attempt to load session
      auth:
        context.auth ??
        ((await auth.api.getSession({
          headers: context.headers,
        })) as unknown as {
          user: User;
          session: Session;
        }),
    },
  });
});
