import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { WalletSecurityMain } from "@/components/onboarding/wallet-security/wallet-security-main";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";

const logger = createLogger();

const routeConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeLoad: async ({ context: { orpc, queryClient } }: any) => {
    const user = await queryClient.fetchQuery({
      ...orpc.user.me.queryOptions(),
      staleTime: 0,
    });
    const { currentStep } = updateOnboardingStateMachine({
      user,
      hasSystem: false,
    });
    if (currentStep !== OnboardingStep.walletSecurity) {
      return redirect({
        to: `/onboarding/${currentStep}`,
      });
    }
    return { currentStep, user };
  },
  component: RouteComponent,
};

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/wallet-security"
)(routeConfig);

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      updateOnboardingStateMachine({ user });
    }
  }, [user]);

  const onNext = useCallback(async () => {
    try {
      await router.invalidate({ sync: true });
    } catch (err: unknown) {
      logger.error("Error invalidating queries", err);
    }
  }, [router]);

  return (
    <OnboardingLayout currentStep={OnboardingStep.walletSecurity}>
      <WalletSecurityMain onNext={onNext} />
    </OnboardingLayout>
  );
}
