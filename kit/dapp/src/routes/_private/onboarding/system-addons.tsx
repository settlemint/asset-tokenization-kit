import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

export const Route = createFileRoute("/_private/onboarding/system-addons")({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
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
    if (user.isOnboarded && currentStep !== OnboardingStep.systemAddons) {
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

  const handleNext = useCallback(() => {
    void navigate({
      to: `/onboarding/${OnboardingStep.identity}`,
    });
  }, [navigate]);

  const handlePrevious = useCallback(() => {
    void navigate({
      to: `/onboarding/${OnboardingStep.systemAssets}`,
    });
  }, [navigate]);

  return (
    <OnboardingLayout currentStep={OnboardingStep.systemAddons}>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Enable Addons</h2>
          <p className="text-sm text-muted-foreground pt-2">
            Enable additional features and integrations for your platform
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl space-y-6">
            <p className="text-sm text-muted-foreground">
              Platform addons configuration will be implemented here.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
