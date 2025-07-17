import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useCallback } from "react";
import { z } from "zod";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-addons"
)({
  validateSearch: zodValidator(
    z.object({
      step: z.enum(Object.values(OnboardingStep)).optional(),
    })
  ),
  beforeLoad: async ({ context: { orpc, queryClient }, search: { step } }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const { currentStep } = updateOnboardingStateMachine({ user });

    if (step) {
      if (step !== OnboardingStep.systemAddons) {
        return redirect({
          to: `/onboarding/${step}`,
        });
      }
    } else {
      if (currentStep !== OnboardingStep.systemAddons) {
        return redirect({
          to: `/onboarding/${currentStep}`,
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: Route.fullPath });

  const onNext = useCallback(async () => {
    await queryClient.refetchQueries({
      queryKey: orpc.user.me.key(),
    });
    await navigate({
      to: `/onboarding/${OnboardingStep.identity}`,
    });
  }, [queryClient, navigate]);

  const onPrevious = useCallback(async () => {
    await navigate({
      to: `/onboarding/${OnboardingStep.systemAssets}`,
      search: () => ({
        step: OnboardingStep.systemAssets,
      }),
    });
  }, [navigate]);

  return (
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
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" onClick={onNext}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
