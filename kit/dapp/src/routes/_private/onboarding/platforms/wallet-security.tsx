import { OnboardingLayout } from "@/components/onboarding/simplified/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/simplified/state-machine";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/onboarding/platforms/wallet-security"
)({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const { currentStep } = updateOnboardingStateMachine({ user });
    if (currentStep !== OnboardingStep.walletSecurity) {
      return redirect({
        to: `/onboarding/platforms/${currentStep}`,
      });
    }
    return { currentStep };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <OnboardingLayout>
      <div>Wallet Verification</div>
    </OnboardingLayout>
  );
}
