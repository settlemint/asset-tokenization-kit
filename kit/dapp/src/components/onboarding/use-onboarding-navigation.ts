import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { useSession } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc/orpc-client";
import type { CurrentUser } from "@/orpc/routes/user/routes/user.me.schema";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

export function useOnboardingNavigation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { refetch } = useSession();

  /**
   * Refreshes user data and updates the onboarding state machine
   */
  const refreshUserState = useCallback(async (): Promise<CurrentUser> => {
    // Clear auth session cache
    await authClient.getSession({
      query: {
        disableCookieCache: true,
      },
    });
    await refetch();
    await queryClient.invalidateQueries({
      queryKey: orpc.user.me.queryKey(),
      refetchType: "all",
    });
    const updatedUser = await queryClient.fetchQuery(
      orpc.user.me.queryOptions()
    );

    // Update the state machine with new data
    updateOnboardingStateMachine({ user: updatedUser });
    return updatedUser;
  }, [queryClient, refetch]);

  /**
   * Complete current step and navigate to next appropriate step
   */
  const completeStepAndNavigate = useCallback(
    async (currentStep: OnboardingStep, nextStep?: OnboardingStep) => {
      // Refresh state to ensure we have latest data
      const updatedUser = await refreshUserState();

      // Determine next step if not provided
      if (!nextStep) {
        switch (currentStep) {
          case OnboardingStep.wallet:
            nextStep = OnboardingStep.walletSecurity;
            break;
          case OnboardingStep.walletSecurity:
            nextStep = OnboardingStep.walletRecoveryCodes;
            break;
          case OnboardingStep.walletRecoveryCodes:
            nextStep = updatedUser.onboardingState.isAdmin
              ? OnboardingStep.systemDeploy
              : OnboardingStep.identity;
            break;
          case OnboardingStep.systemDeploy:
            nextStep = OnboardingStep.systemSettings;
            break;
          case OnboardingStep.systemSettings:
            nextStep = OnboardingStep.systemAssets;
            break;
          case OnboardingStep.systemAssets:
            nextStep = OnboardingStep.systemAddons;
            break;
          case OnboardingStep.systemAddons:
            nextStep = OnboardingStep.identity;
            break;
          case OnboardingStep.identity:
            // Navigate to home - onboarding complete
            await navigate({ to: "/" });
            return;
          default:
            throw new Error(`Unknown step: ${currentStep}`);
        }
      }

      await navigate({
        to: `/onboarding/${nextStep}` as const,
      });
    },
    [refreshUserState, navigate]
  );

  /**
   * Navigate directly to a specific onboarding step
   */
  const navigateToStep = useCallback(
    async (step: OnboardingStep) => {
      await navigate({
        to: `/onboarding/${step}` as const,
      });
    },
    [navigate]
  );

  return {
    refreshUserState,
    completeStepAndNavigate,
    navigateToStep,
  };
}
