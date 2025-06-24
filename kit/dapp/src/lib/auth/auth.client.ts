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
 *
 * @see {@link ./index} - Server-side authentication configuration
 * @see https://better-auth.com - Better Auth documentation
 */

import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  passkeyClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from ".";
import {
  accessControl,
  adminRole,
  investorRole,
  issuerRole,
} from "./permissions";

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
 *
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
     * Infers additional user fields from the server configuration.
     * This ensures the client knows about custom fields like:
     * - wallet: Ethereum wallet address
     * - pincodeEnabled: Whether pincode authentication is enabled
     * - secretCodeEnabled: Whether secret code authentication is enabled
     * - twoFactorEnabled: Whether 2FA is enabled
     * - verification IDs for different authentication methods
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
        investor: investorRole,
        issuer: issuerRole,
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
  ],
});
