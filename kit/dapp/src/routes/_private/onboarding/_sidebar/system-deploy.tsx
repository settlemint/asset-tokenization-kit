import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { DeploymentDetails } from "@/components/onboarding/system/deployment-details";
import { SystemDeploy } from "@/components/onboarding/system/system-deploy";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-deploy"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemDeploy),
  component: SystemDeployComponent,
});

function SystemDeployComponent() {
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  if (!user.onboardingState.system) {
    return <SystemDeploy />;
  }

  return <DeploymentDetails />;
}
