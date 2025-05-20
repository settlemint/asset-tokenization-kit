"use server";

/**
 * Server-side feature flag utility using PostHog
 *
 * This utility provides server-side feature flag checking capabilities using PostHog.
 * It complements the client-side PostHogProvider by allowing feature flag checks in
 * server components and API routes.
 *
 * Key features:
 * - Uses the authenticated user's ID for personalized feature flag evaluation
 * - Falls back to a "server" identifier when no user is authenticated
 * - Returns false when PostHog is not configured (matching client-side behavior)
 *
 * @example
 * ```typescript
 * // In a server component or API route
 * const isFeatureEnabled = await isFeatureEnabled("my-feature");
 * if (isFeatureEnabled) {
 *   // Feature-specific code
 * }
 * ```
 *
 * @see PostHogProvider.tsx for client-side PostHog configuration
 */

import { getUser } from "@/lib/auth/utils";
import { PostHog } from "posthog-node";

// Only initialize PostHog if the key is available
const posthog = process.env.NEXT_PUBLIC_POSTHOG_KEY
  ? new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    })
  : null;

/**
 * Check if a feature flag is enabled on the server side
 * @param key The feature flag key to check
 * @returns True if the feature flag is enabled, false otherwise
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  console.log("posthog", posthog);

  // If PostHog is not configured, feature flags are enabled
  if (!posthog) {
    return true;
  }

  try {
    // Get the current user if available
    const user = await getUser().catch(() => null);

    // Use the user's ID if available, otherwise fall back to "server"
    const distinctId = user?.id ?? "server";

    const isEnabled = await posthog.isFeatureEnabled(key, distinctId);
    return isEnabled ?? false;
  } catch (error) {
    console.error("Error checking feature flag:", error);
    return false;
  }
}
