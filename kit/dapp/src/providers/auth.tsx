/**
 * Authentication Provider Component
 *
 * This module provides authentication context and UI components for the application.
 * It integrates Better Auth with TanStack Query and TanStack Router to provide
 * a complete authentication solution with:
 *
 * - Session management and user state
 * - Authentication UI components (login, signup, etc.)
 * - Optimistic updates for better UX
 * - Passkey/WebAuthn support
 * - Toast notifications for auth events
 * - Router integration for navigation after auth actions
 *
 * The provider wraps two key contexts:
 * 1. AuthQueryProvider - Manages auth state with TanStack Query
 * 2. AuthUIProviderTanstack - Provides pre-built auth UI components
 *
 * @see {@link @/lib/auth/auth.client} - Authentication client configuration
 * @see {@link https://better-auth.com} - Better Auth documentation
 */

import { AuthQueryProvider } from '@daveyplate/better-auth-tanstack';
import { AuthUIProviderTanstack } from '@daveyplate/better-auth-ui/tanstack';
import { Link, useRouter } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth/auth.client';
import enAuthTranslations from '../../locales/en/auth.json';

/**
 * Authentication provider that wraps the application with auth context.
 *
 * This provider integrates authentication functionality throughout the app,
 * providing hooks and components for:
 * - User authentication state (`useSession`, `useUser`)
 * - Auth operations (`useSignIn`, `useSignUp`, `useSignOut`)
 * - Pre-built UI components (`<SignIn />`, `<SignUp />`, etc.)
 * - Automatic session refresh and persistence
 *
 * @param children - Child components that need access to authentication
 *
 * @example
 * ```tsx
 * // Using auth hooks in a component
 * import { useSession } from '@daveyplate/better-auth-tanstack';
 *
 * function UserProfile() {
 *   const { data: session, isLoading } = useSession();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!session) return <div>Not logged in</div>;
 *
 *   return <div>Welcome {session.user.email}!</div>;
 * }
 *
 * // Using pre-built auth components
 * import { SignIn } from '@daveyplate/better-auth-ui/tanstack';
 *
 * function LoginPage() {
 *   return <SignIn />;
 * }
 * ```
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { t } = useTranslation('auth');

  const localization = Object.fromEntries(
    Object.keys(enAuthTranslations).map((key) => [
      key,
      t(key as keyof typeof enAuthTranslations),
    ])
  ) as { [K in keyof typeof enAuthTranslations]: string };

  return (
    <AuthQueryProvider>
      <AuthUIProviderTanstack
        /**
         * The configured auth client instance.
         * Handles all authentication operations and state management.
         */
        apiKey={true}
        /**
         * Navigation function for redirects after auth actions.
         * Integrates with TanStack Router for type-safe navigation.
         */
        authClient={authClient}
        /**
         * Replace navigation for auth flows.
         * Replaces the current history entry instead of pushing a new one.
         */
        credentials={true}
        /**
         * Link component for auth UI navigation.
         * Uses TanStack Router's Link for client-side navigation.
         */
        gravatar={true}
        /**
         * Enable optimistic updates for auth operations.
         * Updates UI immediately before server confirmation for better UX.
         */
        Link={({ href, ...props }) => <Link to={href} {...props} />}
        /**
         * Disable client persistence.
         * Auth state is managed by cookies, not localStorage.
         */
        localization={localization}
        /**
         * Enable passkey/WebAuthn support.
         * Allows users to authenticate with biometrics or security keys.
         */
        nameRequired={true}
        navigate={(href) => router.navigate({ href })}
        optimistic={true}
        passkey={true}
        persistClient={false}
        redirectTo="/"
        /**
         * Toast notification handler for auth events.
         * Displays success, error, warning, and info messages using Sonner.
         */
        replace={(href) => router.navigate({ href, replace: true })}
        toast={({ variant, message }) => {
          if (variant === 'success') {
            toast.success(message);
          } else if (variant === 'error') {
            toast.error(message);
          } else if (variant === 'warning') {
            toast.warning(message);
          } else {
            toast.info(message);
          }
        }}
      >
        {children}
      </AuthUIProviderTanstack>
    </AuthQueryProvider>
  );
}
