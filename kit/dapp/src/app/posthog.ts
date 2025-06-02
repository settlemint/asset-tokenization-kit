import { PostHog } from "posthog-node";

export function PostHogClient() {
  if (
    !process.env.NEXT_PUBLIC_POSTHOG_KEY ||
    !process.env.NEXT_PUBLIC_POSTHOG_HOST
  ) {
    return null;
  }

  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export const posthog = PostHogClient();

export const hasFeatureFlag = async (email: string, featureFlag: string) => {
  if (posthog) {
    const flagEnabled = await posthog.getAllFlags(email);
    return flagEnabled[featureFlag];
  }

  return true;
};
