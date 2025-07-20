import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import type { orpc } from "@/orpc/orpc-client";
import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

/**
 * Creates a standardized search schema for onboarding routes
 * @param customSubSteps - Optional array of custom substeps (defaults to ["intro", "complete"])
 */
export function createOnboardingSearchSchema(
  customSubSteps?: readonly string[]
) {
  const subSteps = customSubSteps ?? (["intro", "complete"] as const);
  return zodValidator(
    z.object({
      step: z
        .enum(Object.values(OnboardingStep) as [string, ...string[]])
        .optional(),
      subStep: z.enum(subSteps as [string, ...string[]]).optional(),
    })
  );
}

interface BeforeLoadContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

interface BeforeLoadSearch {
  step?: OnboardingStep;
  subStep?: string;
}

/**
 * Creates a standardized beforeLoad function for onboarding routes
 * @param expectedStep - The expected OnboardingStep for this route
 */
export function createOnboardingBeforeLoad(expectedStep: OnboardingStep) {
  return async ({
    context,
    search,
  }: {
    context: BeforeLoadContext;
    search: BeforeLoadSearch;
  }) => {
    // 1. Fetch user data
    const user = await context.queryClient.ensureQueryData(
      context.orpc.user.me.queryOptions()
    );

    // 2. Update state machine and get current step
    const { currentStep } = updateOnboardingStateMachine({ user });

    // 3. Early return for "complete" subStep
    if (search.subStep === "complete") return;

    // 4. Redirect logic based on step parameter
    if (search.step) {
      if (search.step !== expectedStep) {
        throw redirect({
          to: `/onboarding/${search.step}`,
        });
      }
    } else {
      if (currentStep !== expectedStep) {
        throw redirect({
          to: `/onboarding/${currentStep}`,
        });
      }
    }

    return {
      user,
    };
  };
}
