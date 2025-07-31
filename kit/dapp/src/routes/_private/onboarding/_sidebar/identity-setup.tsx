import { IdentityCreate } from "@/components/onboarding/identity-setup/identity-create";
import { IdentityCreated } from "@/components/onboarding/identity-setup/identity-created";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/identity-setup"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.identitySetup),
  component: RouteComponent,
});

function RouteComponent() {
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  if (!user.onboardingState.identitySetup) {
    return <IdentityCreate />;
  }

  return <IdentityCreated />;
}
