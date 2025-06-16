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

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private")({
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
        <Outlet />
      </SignedIn>
    </>
  );
}
