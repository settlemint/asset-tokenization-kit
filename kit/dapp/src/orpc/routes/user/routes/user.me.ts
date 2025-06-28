/**
 * Current User Handler
 *
 * This handler returns information about the currently authenticated user.
 * It provides a simple way for clients to fetch the logged-in user's profile
 * data without needing to manage session state directly.
 * @see {@link ../user.me.schema} - Output schema definition
 * @see {@link @/orpc/procedures/auth.router} - Authentication requirements
 */

import { authRouter } from "@/orpc/procedures/auth.router";

/**
 * Get current authenticated user information.
 *
 * Returns the user object from the authentication context, which includes
 * essential profile information such as name, email, and wallet address.
 * This endpoint is commonly used for:
 * - Displaying user information in the UI
 * - Determining user permissions and capabilities
 * - Personalizing the application experience
 * @auth Required - User must be authenticated
 * @function GET /user/me
 * @param context - Request context containing authenticated user information
 * @returns User object with profile data and wallet address
 * @throws {ORPCError} UNAUTHORIZED - If user is not authenticated
 * @example
 * ```typescript
 * // Client usage:
 * const user = await orpc.user.me.query();
 * console.log(`Welcome ${user.name}!`);
 *
 * // Display wallet address
 * console.log(`Wallet: ${user.wallet}`);
 *
 * // Use in React component
 * const { data: user, isLoading } = orpc.user.me.useQuery();
 * ```
 */
export const me = authRouter.user.me.handler(({ context }) => {
  const user = context.auth.user;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    wallet: user.wallet ?? null,
    initialOnboardingFinished: user.initialOnboardingFinished ?? false,
  };
});
