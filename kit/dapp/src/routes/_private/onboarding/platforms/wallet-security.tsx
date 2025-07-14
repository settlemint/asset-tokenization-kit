import { OnboardingLayout } from "@/components/onboarding/simplified/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/simplified/state-machine";
import { WalletSecurityMain } from "@/components/onboarding/simplified/wallet-security/wallet-security-main";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

const logger = createLogger();

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
    return { currentStep, user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      updateOnboardingStateMachine({ user });
    }
  }, [user]);

  const onNext = useCallback(() => {
    router.invalidate().catch((err: unknown) => {
      logger.error("Error invalidating router", err);
    });
  }, [router]);

  return (
    <OnboardingLayout>
      <WalletSecurityMain onNext={onNext} />
    </OnboardingLayout>
  );
}
