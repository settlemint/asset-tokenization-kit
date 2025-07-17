import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <OnboardingGuard require="onboarded">
      <Outlet />
    </OnboardingGuard>
  );
}
