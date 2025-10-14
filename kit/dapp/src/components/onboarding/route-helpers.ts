import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import type { orpc } from "@/orpc/orpc-client";
import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import * as z from "zod";

const onboardingSearchSchema = z.object({
  step: z.enum(Object.values(OnboardingStep)).optional(),
  complete: z.boolean().default(false),
});
type OnboardingSearchSchema = z.infer<typeof onboardingSearchSchema>;

/**
 * Creates a standardized search schema for onboarding routes
 * @param customSubSteps - Optional array of custom substeps (defaults to ["intro", "complete"])
 */
export function createOnboardingSearchSchema() {
  return zodValidator(onboardingSearchSchema);
}

interface BeforeLoadContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

/**
 * Creates a standardized beforeLoad function for onboarding routes
 * @param expectedStep - The expected OnboardingStep for this route
 */
export function createOnboardingBeforeLoad(expectedStep?: OnboardingStep) {
  return async ({
    context,
    search,
  }: {
    context: BeforeLoadContext;
    search: OnboardingSearchSchema;
  }) => {
    // 1. Fetch user data
    const user = await context.queryClient.ensureQueryData(
      context.orpc.user.me.queryOptions()
    );

    // 2. Update state machine and get current step
    const stateMachine = updateOnboardingStateMachine({ user });

    if (search.complete) {
      return { user, ...stateMachine };
    }

    // 4. Redirect logic based on step parameter
    if (search.step && search.step !== expectedStep) {
      throw redirect({
        to: `/onboarding/${search.step}`,
      });
    } else if (expectedStep && stateMachine.currentStep !== expectedStep) {
      throw redirect({
        to: `/onboarding/${stateMachine.currentStep}`,
      });
    }

    return { user, ...stateMachine };
  };
}
