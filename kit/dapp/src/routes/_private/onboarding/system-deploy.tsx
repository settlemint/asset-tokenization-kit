import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { SystemBootstrapMain } from "@/components/onboarding/system/system-bootstrap-main";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

export const Route = createFileRoute("/_private/onboarding/system-deploy")({
  beforeLoad: async ({ context: { orpc, queryClient }, search }) => {
    const user = await queryClient.fetchQuery({
      ...orpc.user.me.queryOptions(),
      staleTime: 0,
    });

    // Check if a system exists
    let hasSystem = false;
    try {
      const systemAddress = await queryClient.fetchQuery({
        ...orpc.settings.read.queryOptions({
          input: { key: "SYSTEM_ADDRESS" },
        }),
        staleTime: 0,
      });
      hasSystem = !!(systemAddress && systemAddress.trim() !== "");
    } catch {
      hasSystem = false;
    }

    const { currentStep } = updateOnboardingStateMachine({ user, hasSystem });

    // Allow navigation back from system-settings even if it's not the current step
    const fromStep = (search as { from?: string })?.from;
    const isNavigatingBack = fromStep === OnboardingStep.systemSettings;

    if (
      user.isOnboarded &&
      currentStep !== OnboardingStep.systemDeploy &&
      !isNavigatingBack
    ) {
      return redirect({
        to: `/onboarding/${currentStep}`,
      });
    }
    return { currentStep, user, hasSystem };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  const handleNext = useCallback(() => {
    void navigate({
      to: `/onboarding/${OnboardingStep.systemSettings}`,
    });
  }, [navigate]);

  const handlePrevious = useCallback(() => {
    void navigate({
      to: `/onboarding/${OnboardingStep.walletRecoveryCodes}`,
    });
  }, [navigate]);

  // Navigation is handled by the onNext callback when deployment completes

  return (
    <OnboardingLayout currentStep={OnboardingStep.systemDeploy}>
      <SystemBootstrapMain
        onNext={handleNext}
        onPrevious={handlePrevious}
        isFirstStep={false}
        isLastStep={false}
        user={user ?? undefined}
      />
    </OnboardingLayout>
  );
}
