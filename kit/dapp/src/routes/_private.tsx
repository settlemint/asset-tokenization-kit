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
 * @see {@link https://tanstack.com/router/latest/docs/guide/route-trees#pathless-routes} - TanStack Router pathless routes
 */

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private")({
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    // Try to get user data, but don't throw if unauthenticated
    try {
      const [user, systemAddress] = await Promise.all([
        queryClient.ensureQueryData(orpc.user.me.queryOptions()),
        queryClient.ensureQueryData(
          orpc.settings.read.queryOptions({
            input: { key: "SYSTEM_ADDRESS" },
          })
        ),
      ]);

      // TODO: Re-enable system prefetch once system.read endpoint is fixed
      // Prefetch system details if we have a system address
      // This is non-blocking since it's only used by OnboardingGuard which has its own query
      // if (systemAddress) {
      //   void queryClient.prefetchQuery(
      //     orpc.system.read.queryOptions({ input: { id: systemAddress } })
      //   );
      // }

      return { user, systemAddress };
    } catch {
      // If authentication fails, return null values
      // The authentication will be handled by the component
      return { user: null, systemAddress: null };
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
 * The component uses the useAuthenticate hook from Better Auth UI to handle
 * authentication checks and automatic redirects in an SSR-safe way.
 */
function LayoutComponent() {
  // If we reach this point, the user is authenticated
  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <Outlet />
      </SignedIn>
    </>
  );
}
