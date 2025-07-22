import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SecuritySuccess() {
  const { t } = useTranslation(["onboarding", "general"]);
  const { completeStepAndNavigate } = useOnboardingNavigation();

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 bg-sm-state-success/10 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-sm-state-success" />
          </div>
          <div className="absolute -top-1 -right-1">
            <CheckCircle className="w-8 h-8 text-sm-state-success bg-background rounded-full" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          {t("wallet-security.method-selector.success")}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("wallet-security.method-selector.success-description")}
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          onClick={() =>
            void completeStepAndNavigate(OnboardingStep.walletSecurity)
          }
          className="flex-1"
        >
          {t("general:continue")}
        </Button>
      </div>
    </div>
  );
}
