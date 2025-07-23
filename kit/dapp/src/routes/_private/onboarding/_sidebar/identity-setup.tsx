import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/identity-setup"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.identitySetup),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { navigateToStep } = useOnboardingNavigation();

  const handleComplete = () => {
    // Navigate to the next step (identity verification)
    // Note: identitySetup tracking will be implemented server-side
    void navigateToStep(OnboardingStep.identity);
  };

  return (
    <OnboardingStepLayout
      title={t("onboarding:steps.identity-setup.title")}
      description={t("onboarding:steps.identity-setup.description")}
      actions={
        <Button onClick={handleComplete} className="w-40">
          {t("common:continue")}
        </Button>
      }
    >
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 flex flex-col items-center">
          <p className="text-sm text-center">
            {t("onboarding:identity-setup.info")}
          </p>
          <div className="bg-info/10 border border-info/20 rounded-md p-4 w-full">
            <h3 className="text-sm text-info-foreground font-medium mb-1">
              {t("onboarding:identity-setup.coming-soon")}
            </h3>
            <p className="text-sm text-info-foreground">
              {t("onboarding:identity-setup.coming-soon-description")}
            </p>
          </div>
        </div>
      </div>
    </OnboardingStepLayout>
  );
}
