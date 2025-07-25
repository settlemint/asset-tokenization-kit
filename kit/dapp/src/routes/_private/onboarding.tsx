import { DialogLayout } from "@/components/layout/dialog";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding")({
  component: OnboardingLayout,
});

function OnboardingLayout() {
  return (
    <DialogLayout>
      <Outlet />
    </DialogLayout>
  );
}
