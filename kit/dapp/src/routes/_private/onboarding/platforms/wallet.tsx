import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/simplified/state-machine";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/onboarding/platforms/wallet")({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const currentStep = updateOnboardingStateMachine({ user });
    if (currentStep !== OnboardingStep.wallet) {
      return redirect({
        to: `/onboarding/platforms/${currentStep}`,
      });
    }
    return { currentStep };
  },
  component: RouteComponent,
});

function RouteComponent() {
  // Invalidating the route after a mutation by using route.invalidate() https://chatgpt.com/share/6874c73d-4274-8012-a72c-394623734845
  return <div>Wallet</div>;
}
