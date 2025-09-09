import { Context } from "@/orpc/context/context";
import { baseRouter } from "../../procedures/base.router";

/**
 * Authentication enforcement middleware.
 *
 * This middleware enforces strict authentication requirements for protected
 * procedures. It validates that a valid authentication session exists in the
 * request context and throws an UNAUTHORIZED error if authentication is
 * missing or invalid.
 *
 * The middleware:
 * - Checks for existing auth context (typically set by session middleware)
 * - If valid auth exists, passes it through to the next middleware/handler
 * - If no auth exists, throws UNAUTHORIZED error immediately
 * - Ensures only authenticated users can access protected procedures
 *
 * This middleware should be used after session middleware in the middleware
 * chain to ensure authentication context has been loaded before validation.
 *
 * Typical usage pattern:
 * 1. Session middleware loads auth context (optional)
 * 2. Auth middleware validates auth context (required)
 * 3. Protected procedure executes with guaranteed auth context
 * @example
 * ```typescript
 * // Used in authenticated router
 * export const ar = pr.use(authMiddleware);
 *
 * // In a protected procedure handler
 * export const updateProfile = ar.user.update.handler(async ({ context }) => {
 *   // context.auth is guaranteed to exist and be valid
 *   const userId = context.auth.user.id;
 *   return updateUserProfile(userId, input);
 * });
 * ```
 * @throws UNAUTHORIZED - When authentication is missing or invalid
 * @see {@link ./session.middleware} - Session loading middleware (should run first)
 * @see {@link ../../routes/procedures/auth.contract} - UNAUTHORIZED error definition
 */
export const authMiddleware = baseRouter.middleware<
  Pick<Context, "auth">,
  unknown
>(async ({ context, next, errors }) => {
  // Check if valid authentication context exists
  if (context.auth?.user) {
    // Authentication is valid, proceed with the authenticated context
    return next({
      context: {
        auth: context.auth,
      },
    });
  }

  // No valid authentication found, reject the request
  throw errors.UNAUTHORIZED();
});
