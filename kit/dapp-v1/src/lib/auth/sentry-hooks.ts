import {
  setSentryUser,
  startSentrySession,
  endSentrySession,
  addActionBreadcrumb,
} from "@/lib/sentry";
import type { User } from "./types";

/**
 * Handle user sign-in for Sentry tracking
 *
 * @param user - The user who signed in
 */
export function handleSentrySignIn(user: User) {
  // Set user context
  setSentryUser(user);

  // Start a new session
  startSentrySession();

  // Add breadcrumb
  addActionBreadcrumb("User signed in", {
    userId: user.id,
    method: user.twoFactorEnabled ? "2fa" : "standard",
  });
}

/**
 * Handle user sign-out for Sentry tracking
 */
export function handleSentrySignOut() {
  // Add breadcrumb before clearing user
  addActionBreadcrumb("User signed out");

  // Clear user context
  setSentryUser(null);

  // End the session
  endSentrySession();
}

/**
 * Track authentication errors in Sentry
 *
 * @param error - The authentication error
 * @param context - Additional context about the error
 */
export function trackAuthError(
  error: Error,
  context: {
    action: "signin" | "signup" | "password-reset" | "2fa" | "magic-link";
    email?: string;
  }
) {
  import("@sentry/nextjs").then(({ captureException }) => {
    captureException(error, {
      tags: {
        "auth.action": context.action,
        "auth.error": "true",
      },
      contexts: {
        auth: {
          action: context.action,
          email: context.email,
        },
      },
      level: "warning",
    });
  });
}
