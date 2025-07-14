import { OnboardingLayout } from "@/components/onboarding/simplified/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/simplified/state-machine";
import { WalletDisplayStep } from "@/components/onboarding/simplified/steps/wallet-display-step";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

const logger = createLogger();

export const Route = createFileRoute("/_private/onboarding/platforms/wallet")({
  loader: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const { currentStep } = updateOnboardingStateMachine({ user });
    if (user.isOnboarded && currentStep !== OnboardingStep.wallet) {
      return redirect({
        to: `/onboarding/platforms/${currentStep}`,
      });
    }
    return { currentStep };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const onNext = useCallback(() => {
    navigate({
      to: `/onboarding/platforms/${OnboardingStep.walletSecurity}`,
    }).catch((err: unknown) => {
      logger.error("Error navigating to wallet security", err);
    });
  }, [navigate]);

  return (
    <OnboardingLayout>
      <WalletDisplayStep onNext={onNext} />
    </OnboardingLayout>
  );
}
