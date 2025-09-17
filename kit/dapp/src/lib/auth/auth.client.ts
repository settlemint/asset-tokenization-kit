/**
 * Client-Side Authentication Configuration
 *
 * This module configures the client-side authentication system using Better Auth.
 * It creates a type-safe authentication client that mirrors the server-side
 * configuration, ensuring consistency across the application.
 *
 * The client is configured with multiple authentication plugins to support:
 * - Admin functionality for user management
 * - API key authentication for programmatic access
 * - Passkey/WebAuthn support for passwordless authentication
 * - Custom user fields (wallet, pincode settings, etc.) via type inference
 * @see {@link ./index} - Server-side authentication configuration
 * @see https://better-auth.com - Better Auth documentation
 */

import { pincodeClient } from "@/lib/auth/plugins/pincode-plugin/client";
import { secretCodesClient } from "@/lib/auth/plugins/secret-codes-plugin/client";
import { twoFactorClient } from "@/lib/auth/plugins/two-factor/client";
import {
  adminClient,
  apiKeyClient,
  customSessionClient,
  inferAdditionalFields,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from ".";
import { accessControl, adminRole, userRole } from "./utils/permissions";

/**
 * The main authentication client instance for the application.
 *
 * This client provides React hooks and utilities for:
 * - User authentication (sign in, sign up, sign out)
 * - Session management
 * - API key operations
 * - Admin user management
 * - Passkey/WebAuthn authentication
 *
 * The client automatically includes credentials with requests and
 * manages authentication state across the application.
 * @example
 * ```typescript
 * // In a React component
 * import { authClient } from '@/lib/auth/auth.client';
 *
 * function LoginComponent() {
 *   const { signIn } = authClient.useSignIn();
 *
 *   const handleLogin = async () => {
 *     await signIn.email({
 *       email: 'user@example.com',
 *       password: 'password'
 *     });
 *   };
 * }
 * ```
 */
export const authClient = createAuthClient({
  plugins: [
    /**
     * Custom session plugin for the application.
     */
    customSessionClient<typeof auth>(),

    /**
     * Infers additional user fields from the server configuration.
     */
    inferAdditionalFields<typeof auth>(),

    /**
     * Admin plugin for user management operations.
     * Provides functionality for admin users to:
     * - List and search users
     * - Update user roles and permissions
     * - Manage user accounts
     */
    adminClient({
      ac: accessControl,
      roles: {
        admin: adminRole,
        user: userRole,
      },
    }),

    /**
     * API key plugin for programmatic access.
     * Enables:
     * - Creating and managing API keys
     * - Authenticating with API keys for automated workflows
     * - Revoking and rotating keys
     */
    apiKeyClient(),

    /**
     * Passkey plugin for WebAuthn support.
     * Provides passwordless authentication using:
     * - Biometric authentication (fingerprint, face ID)
     * - Security keys (YubiKey, etc.)
     * - Platform authenticators
     */
    passkeyClient(),

    /**
     * Pincode plugin for pincode authentication.
     * Provides functionality for:
     * - Setting pincode
     * - Removing pincode
     * - Updating pincode
     */
    pincodeClient(),

    /**
     * Two factor plugin for two factor authentication.
     * Provides functionality for:
     * - Enabling two factor authentication
     * - Disabling two factor authentication
     * - Verifying two factor authentication
     */
    twoFactorClient(),

    /**
     * Secret codes plugin for secret codes authentication.
     * Provides functionality for:
     * - Enabling secret codes authentication
     * - Disabling secret codes authentication
     * - Verifying secret codes authentication
     */
    secretCodesClient(),
  ],
});
