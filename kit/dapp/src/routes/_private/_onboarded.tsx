import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/_private/_onboarded")({
  component: LayoutComponent,
});

/**
 *
 */
function LayoutComponent() {
  const user = useMemo(
    () => ({
      name: "John Doe",
      email: "john.doe@example.com",
      address: "0x1234567890123456789012345678901234567890",
    }),
    []
  );
  return (
    <OnboardingGuard require="onboarded">
      <Outlet />
    </OnboardingGuard>
  );
}
