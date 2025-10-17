/**
 * Dynamic Authentication Route
 *
 * This module implements a dynamic route that handles various authentication
 * pages based on the pathname parameter. It provides a unified entry point
 * for all authentication flows including:
 *
 * - /auth/signin - User login page
 * - /auth/signup - User registration page
 * - /auth/forgot-password - Password reset request
 * - /auth/reset-password - Password reset form
 * - /auth/verify-email - Email verification
 * - /auth/error - Authentication error display
 *
 * The route uses Better Auth's AuthCard component which automatically
 * renders the appropriate authentication form based on the pathname.
 * @see {@link https://better-auth.com/docs/ui/auth-card} - AuthCard documentation
 */

import { AuthView } from "@daveyplate/better-auth-ui";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/auth/$pathname")({
  component: RouteComponent,
});

/**
 * Route component that renders the appropriate authentication form.
 *
 * Uses the pathname parameter to determine which authentication flow
 * to display. The AuthCard component handles all the authentication
 * logic and UI, including form validation, error handling, and
 * API communication.
 *
 * The component is wrapped in Suspense to handle any lazy-loaded
 * dependencies within the AuthCard component.
 */
function RouteComponent() {
  const { pathname } = Route.useParams();

  return (
    <main className="my-auto flex flex-col items-center w-full max-w-md px-4">
      <Suspense>
        <AuthView
          pathname={pathname}
          className="w-full !shadow-[0_10px_40px_rgba(0,0,0,0.25)] dark:!shadow-[0_35px_80px_-20px_rgba(0,0,0,0.9),0_0_140px_36px_rgba(255,255,255,0.06)]"
        />
      </Suspense>
    </main>
  );
}
