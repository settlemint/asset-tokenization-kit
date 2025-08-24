import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { SystemAddonsDeployment } from "@/components/system-addons/onboarding/system-addons-deployment";
import { SystemAddonsSelection } from "@/components/system-addons/onboarding/system-addons-selection";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-addons"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemAddons),
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  if (!user.onboardingState.systemAddons) {
    return <SystemAddonsSelection />;
  }

  return <SystemAddonsDeployment />;
}
