import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import {
  OnboardingStep,
  onboardingStateMachine,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { IdCard } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/identity-setup"
)({
  validateSearch: zodValidator(createOnboardingSearchSchema()),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.identitySetup),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation(["onboarding", "common"]);
  const { navigateToStep, refreshUserState } = useOnboardingNavigation();

  const handleComplete = async () => {
    // Mark identity setup step as complete via proper state update
    const updatedUser = await refreshUserState();
    updateOnboardingStateMachine({
      user: {
        ...updatedUser,
        onboardingState: {
          ...updatedUser.onboardingState,
          identitySetup: true,
        },
      },
    });

    // Navigate to the next step (identity verification)
    void navigateToStep(OnboardingStep.identity);
  };

  const handleBack = () => {
    // Navigate back to the previous step
    const state = onboardingStateMachine.state;
    const previousStep = state.isAdmin
      ? OnboardingStep.systemAddons
      : OnboardingStep.walletRecoveryCodes;

    void navigateToStep(previousStep);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <IdCard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">
            {t("onboarding:steps.identity-setup.title")}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t("onboarding:steps.identity-setup.description")}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 space-y-4">
            <p className="text-sm">
              Setting up your ONCHAINID creates a secure, decentralized identity
              that enables you to interact with digital assets while maintaining
              privacy and compliance.
            </p>
            <div className="bg-info/10 border border-info/20 rounded-md p-4">
              <h3 className="text-sm text-info-foreground font-medium mb-1">
                Coming Soon
              </h3>
              <p className="text-sm text-info-foreground">
                ONCHAINID setup is currently under development. For now, we'll
                prepare your identity framework for future use.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-8">
          <Button onClick={handleBack} variant="outline" className="w-40">
            {t("common:previous")}
          </Button>
          <Button onClick={handleComplete} className="w-40">
            {t("common:continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}
