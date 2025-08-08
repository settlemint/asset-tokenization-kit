import { KycForm } from "@/components/kyc/kyc-form";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { InfoAlert } from "@/components/ui/info-alert";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/_sidebar/identity")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.identity),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { completeStepAndNavigate } = useOnboardingNavigation();

  return (
    <OnboardingStepLayout
      title={t("identity.title")}
      description={t("identity.description")}
    >
      <InfoAlert
        title={t("identity.title")}
        description={t("identity.intro")}
      />
      <KycForm
        onComplete={async () => {
          await completeStepAndNavigate(OnboardingStep.identity);
        }}
      />
    </OnboardingStepLayout>
  );
}
