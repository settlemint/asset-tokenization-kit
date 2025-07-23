import { KycForm } from "@/components/kyc/kyc-form";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { InfoAlert } from "@/components/ui/info-alert";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_private/onboarding/_sidebar/identity")({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.identity),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const navigate = useNavigate();
  const { refreshUserState } = useOnboardingNavigation();

  const handleComplete = async () => {
    await refreshUserState();
    // Navigate to home page (onboarding complete)
    void navigate({ to: "/" });
  };

  return (
    <OnboardingStepLayout
      title={t("onboarding:steps.identity.title")}
      description={t("onboarding:steps.identity.description")}
    >
      <InfoAlert title={t("onboarding:identity.intro")} />
      <KycForm onComplete={handleComplete} />
    </OnboardingStepLayout>
  );
}
