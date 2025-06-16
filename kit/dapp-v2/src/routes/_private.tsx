/**
 * Private Route Layout
 *
 * This module defines a protected route layout that requires authentication.
 * It serves as a parent route for all private/authenticated areas of the application.
 *
 * Features:
 * - Authentication check before loading any child routes
 * - Automatic redirect to sign-in for unauthenticated users
 * - Shared layout with header controls for authenticated pages
 * - User data prefetching for child routes
 *
 * The underscore prefix (_private) makes this a pathless route in TanStack Router,
 * meaning it doesn't add to the URL path but provides layout and data loading.
 *
 * @see {@link https://tanstack.com/router/latest/docs/guide/route-trees#pathless-routes} - TanStack Router pathless routes
 */

import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { orpc } from "@/orpc";
import type { User } from "@/orpc/routes/user/routes/user.me.schema";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_private")({
  /**
   * Authentication guard that runs before the route loads.
   *
   * This ensures the user is authenticated before any child routes are rendered.
   * If the user data fetch fails (401/403), the error boundary will handle it
   * and redirect to sign-in. Successfully fetched user data is made available
   * to all child routes through the route context.
   *
   * @returns User data that will be merged into the route context
   */
  beforeLoad: async ({ context }) => {
    try {
      const user: User = await context.queryClient.ensureQueryData(
        orpc.user.me.queryOptions({})
      );
      return { user };
    } catch {
      throw redirect({
        to: "/auth/$pathname",
        params: { pathname: "/sign-in" },
      });
    }
  },
  component: LayoutComponent,
});

/**
 * Layout component for authenticated pages.
 *
 * Provides a consistent layout structure for all private routes including:
 * - Authentication state management with automatic redirects
 * - Header with application controls (language switcher, theme toggle)
 * - Container for child route content
 *
 * The component uses Better Auth UI components to handle authentication:
 * - RedirectToSignIn: Redirects unauthenticated users to the sign-in page
 * - SignedIn: Only renders children when user is authenticated
 */
function LayoutComponent() {
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div>
          <div className="flex items-center justify-between p-4 border-b">
            <div>Private Area</div>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </SignedIn>
    </>
  );
}
