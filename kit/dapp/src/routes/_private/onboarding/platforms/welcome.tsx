import { updateOnboardingStateMachine } from "@/components/onboarding/simplified/state-machine";
import { WelcomeScreen } from "@/components/onboarding/simplified/steps/welcome-screen";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/platforms/welcome")({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const currentStep = updateOnboardingStateMachine({ user });
    return { currentStep };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <WelcomeScreen />;
}
