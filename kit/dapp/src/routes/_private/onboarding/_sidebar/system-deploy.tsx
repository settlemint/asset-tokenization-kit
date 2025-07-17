import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { SystemBootstrapMain } from "@/components/onboarding/system/system-bootstrap-main";
import { orpc } from "@/orpc/orpc-client";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useCallback } from "react";
import { z } from "zod";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-deploy"
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
      if (step !== OnboardingStep.systemDeploy) {
        return redirect({
          to: `/onboarding/${step}`,
        });
      }
    } else {
      if (currentStep !== OnboardingStep.systemDeploy) {
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
      to: `/onboarding/${OnboardingStep.systemSettings}`,
    });
  }, [queryClient, navigate]);

  const onPrevious = useCallback(async () => {
    await navigate({
      to: `/onboarding/${OnboardingStep.walletRecoveryCodes}`,
    });
  }, [navigate]);

  return <SystemBootstrapMain onNext={onNext} onPrevious={onPrevious} />;
}
