import { useFeatureFlagEnabled } from "posthog-js/react";

/**
 * Client-side hook to check if a feature is enabled based on PostHog feature flags.
 *
 * This hook complements the server-side `isFeatureEnabled` utility in `@/lib/utils/feature-flags.ts`.
 * While both serve similar purposes, they operate in different contexts:
 *
 * - This hook (use-feature-enabled.ts):
 *   - Runs on the client-side in React components
 *   - Uses PostHog's React hooks for real-time feature flag updates
 *   - Suitable for client components marked with "use client"
 *
 * - Server utility (feature-flags.ts):
 *   - Runs on the server-side in Server Components or API routes
 *   - Uses PostHog's Node.js SDK
 *   - Handles user authentication context for personalized flags
 *
 * Both implementations return true if PostHog is not configured (NEXT_PUBLIC_POSTHOG_KEY not set).
 */
export function useFeatureEnabled(featureKey: string): boolean {
  const isEnabled = useFeatureFlagEnabled(featureKey) ?? false;

  // If PostHog is not configured, feature flags are enabled
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return true;
  }

  return isEnabled;
}
