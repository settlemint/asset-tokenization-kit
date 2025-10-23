/**
 * Authentication API Route Handler
 *
 * This module implements the authentication API endpoints for Better Auth.
 * It serves as a catch-all route for all authentication-related requests
 * under the /api/auth/* path.
 *
 * The route delegates all authentication logic to the Better Auth handler,
 * which manages:
 * - User registration and login
 * - Session management
 * - Password reset flows
 * - OAuth provider callbacks
 * - Multi-factor authentication
 * - Passkey/WebAuthn operations
 *
 * Both GET and POST methods are supported to handle various auth flows:
 * - GET: OAuth callbacks, email verification links, etc.
 * - POST: Login, registration, password changes, etc.
 * @see {@link @/lib/auth} - Authentication configuration
 * @see {@link https://better-auth.com} - Better Auth documentation
 */

import { auth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return auth.handler(request);
      },
      POST: ({ request }) => {
        return auth.handler(request);
      },
    },
  },
});
