import type { OnboardingStep } from "@/components/onboarding/state-machine";
import {
  onboardingSteps,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { useSession } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc/orpc-client";
import type { CurrentUser } from "@/orpc/routes/user/routes/user.me.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";
import { zeroAddress } from "viem";

const logger = createLogger();

export function useOnboardingNavigation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { refetch, data: session } = useSession();
  const steps = useStore(onboardingSteps);

  const refreshSession = useCallback(async () => {
    await authClient.getSession({
      query: {
        disableCookieCache: true,
      },
    });
    await refetch();
  }, [refetch]);

  /**
   * Refreshes user data and updates the onboarding state machine
   */
  const refreshUserState = useCallback(async (): Promise<CurrentUser> => {
    try {
      if (session?.user.wallet === zeroAddress) {
        // Clear auth session cache (only for non-wallet users, all other operations automatically update the cookie)
        await refreshSession();
      }
      try {
        await queryClient.invalidateQueries({
          queryKey: orpc.user.me.queryKey(),
          refetchType: "all",
        });
      } catch (invalidateError) {
        logger.error("Failed to invalidate queries", invalidateError);
      }
      const updatedUser = await queryClient.fetchQuery(
        orpc.user.me.queryOptions()
      );

      // Update the state machine with new data
      updateOnboardingStateMachine({ user: updatedUser });
      return updatedUser;
    } catch (error) {
      logger.error("Failed to refresh user state", error);
      throw error;
    }
  }, [queryClient, refreshSession, session?.user.wallet]);

  /**
   * Complete current step and navigate to next appropriate step
   */
  const completeStepAndNavigate = useCallback(
    async (currentStep: OnboardingStep, nextStep?: OnboardingStep) => {
      // Refresh state to ensure we have latest data
      await refreshUserState();

      // Determine next step if not provided
      if (!nextStep) {
        const currentStepIndex = steps.findIndex(
          (step) => step.step === currentStep
        );
        nextStep = steps[currentStepIndex + 1]?.step;
        if (!nextStep) {
          // Reached the last step, navigate to home page (onboarding complete)
          await refreshSession(); // Refresh session to ensure we have latest data (eg kyc name)

          // Invalidate queries to refresh sidebar and user data
          await Promise.all([
            // Invalidate factory list for sidebar
            queryClient.invalidateQueries({
              queryKey: orpc.system.factory.list.key(),
              refetchType: "all",
            }),
            // Invalidate system data
            queryClient.invalidateQueries({
              queryKey: orpc.system.read.key(),
              refetchType: "all",
            }),
            // Invalidate account data for identity
            queryClient.invalidateQueries({
              queryKey: orpc.account.me.key(),
              refetchType: "all",
            }),
          ]);

          await navigate({ to: "/" });
          return;
        }
      }

      if (currentStep === nextStep) {
        return;
      }

      await navigate({
        to: `/onboarding/${nextStep}` as const,
      });
    },
    [refreshUserState, refreshSession, navigate, steps]
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
