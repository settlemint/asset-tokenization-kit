import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { useOnboardingSteps } from "@/components/onboarding/use-onboarding-steps";
import { StepLayout } from "@/components/stepper/step-layout";
import { flattenSteps } from "@/components/stepper/utils";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/_sidebar")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding"]);
  const { currentStep: currentStepId } = Route.useRouteContext();
  const navigate = useNavigate();
  const { stepsOrGroups } = useOnboardingSteps();
  const currentStep = flattenSteps(stepsOrGroups).find(
    (step) => step.id === currentStepId
  );

  if (!currentStep) {
    return null;
  }

  return (
    <StepLayout
      stepsOrGroups={stepsOrGroups}
      currentStep={currentStep}
      onStepSelect={(step) => {
        void navigate({ to: `/onboarding/${step.id}` as const });
      }}
      navigationMode="next-only"
      title={t("onboarding:sidebar.title")}
      description={t("onboarding:sidebar.description")}
      className="rounded-xl"
    >
      <Outlet />
    </StepLayout>
  );
}
