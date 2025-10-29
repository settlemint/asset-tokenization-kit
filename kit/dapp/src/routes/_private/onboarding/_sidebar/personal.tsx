import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { KycForm } from "@/components/kyc/kyc-form";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/_sidebar/personal")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.personal),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { completeStepAndNavigate } = useOnboardingNavigation();

  return (
    <FormStepLayout
      title={t("personal.title")}
      fullWidth={true}
      description={t("personal.description")}
    >
      <div className="text-sm text-muted-foreground space-y-4 mb-6">
        <p>{t("onboarding:personal.intro-paragraph-1")}</p>
        <p>{t("onboarding:personal.intro-paragraph-2")}</p>
        <p>{t("onboarding:personal.intro-paragraph-3")}</p>
      </div>
      <KycForm
        onComplete={async () => {
          await completeStepAndNavigate(OnboardingStep.personal);
        }}
        onSkip={async () => {
          await completeStepAndNavigate(OnboardingStep.personal);
        }}
      />
    </FormStepLayout>
  );
}
