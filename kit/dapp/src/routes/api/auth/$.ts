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
 *
 * @see {@link @/lib/auth} - Authentication configuration
 * @see {@link https://better-auth.com} - Better Auth documentation
 */

import { createServerFileRoute } from '@tanstack/react-start/server';
import { auth } from '@/lib/auth';

export const ServerRoute = createServerFileRoute('/api/auth/$').methods({
  /**
   * Handles GET requests for authentication operations.
   *
   * Used for:
   * - OAuth provider callbacks (e.g., /api/auth/callback/google)
   * - Email verification links
   * - Magic link authentication
   * - Password reset token validation
   */
  GET: ({ request }) => {
    return auth.handler(request);
  },

  /**
   * Handles POST requests for authentication operations.
   *
   * Used for:
   * - User login (/api/auth/sign-in)
   * - User registration (/api/auth/sign-up)
   * - Password reset requests
   * - Session refresh
   * - Logout operations
   * - Multi-factor authentication verification
   */
  POST: ({ request }) => {
    return auth.handler(request);
  },
});
