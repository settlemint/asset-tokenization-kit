import { OnboardingStep } from "@/components/onboarding/state-machine";
import { SystemBootstrapMain } from "@/components/onboarding/system/system-bootstrap-main";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-deploy"
)({
  validateSearch: zodValidator(createOnboardingSearchSchema()),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemDeploy),
  component: RouteComponent,
});

function RouteComponent() {
  const { navigateToStep, completeStepAndNavigate } = useOnboardingNavigation();

  const onNext = () =>
    void completeStepAndNavigate(OnboardingStep.systemDeploy);
  const onPrevious = () =>
    void navigateToStep(OnboardingStep.walletRecoveryCodes);

  return <SystemBootstrapMain onNext={onNext} onPrevious={onPrevious} />;
}
