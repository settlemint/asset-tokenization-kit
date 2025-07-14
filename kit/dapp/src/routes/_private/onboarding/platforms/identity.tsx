import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/simplified/state-machine";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/platforms/identity")(
  {
    loader: async ({ context: { orpc, queryClient } }) => {
      const user = await queryClient.ensureQueryData(
        orpc.user.me.queryOptions()
      );
      const { currentStep } = updateOnboardingStateMachine({ user });
      if (currentStep !== OnboardingStep.identity) {
        return redirect({
          to: `/onboarding/platforms/${currentStep}`,
        });
      }
      return { currentStep };
    },
    component: RouteComponent,
  }
);

function RouteComponent() {
  return <div>Identity</div>;
}
