import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/_onboarded")({
  component: LayoutComponent,
  beforeLoad: async ({ context: { queryClient, orpc } }) => {
    // Ensure factory list is loaded for the sidebar navigation
    await queryClient.ensureQueryData(
      orpc.token.factoryList.queryOptions({
        input: { hasTokens: true },
      })
    );
  },
});

/**
 *
 */
function LayoutComponent() {
  return (
    <OnboardingGuard require="onboarded">
      <Outlet />
    </OnboardingGuard>
  );
}
