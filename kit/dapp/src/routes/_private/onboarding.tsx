import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding")({
  component: OnboardingLayout,
});

/**
 *
 */
function OnboardingLayout() {
  // The onboarding layout is just a pass-through since child routes
  // handle their own backgrounds and layouts
  return <Outlet />;
}
