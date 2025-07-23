import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-addons"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemAddons),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["common", "onboarding"]);
  const { completeStepAndNavigate } = useOnboardingNavigation();

  const onNext = () =>
    void completeStepAndNavigate(OnboardingStep.systemAddons);

  return (
    <OnboardingStepLayout
      title={t("onboarding:system-addons.title")}
      description={t("onboarding:system-addons.subtitle")}
      actions={
        <Button type="button" onClick={onNext}>
          {t("common:continue")}
        </Button>
      }
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm text-muted-foreground">
            {t("onboarding:system-addons.description")}
          </p>
        </div>
      </div>
    </OnboardingStepLayout>
  );
}
