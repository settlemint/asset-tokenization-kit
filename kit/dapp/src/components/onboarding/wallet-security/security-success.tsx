import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function SecuritySuccess() {
  const { t } = useTranslation(["onboarding", "general"]);
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  // Determine which security method was set up
  const hasOtp = user.verificationTypes.includes("two-factor");
  const securityMethod = hasOtp
    ? t("wallet-security.method-selector.security-methods.one-time-password")
    : t("wallet-security.method-selector.security-methods.pin-code");

  return (
    <OnboardingStepLayout
      title={t("wallet-security.method-selector.success")}
      description={t("wallet-security.method-selector.success-description")}
      actions={
        <div className="flex gap-3 pt-4">
          <Button
            onClick={() =>
              void completeStepAndNavigate(OnboardingStep.walletSecurity)
            }
            className="flex-1"
          >
            {t("wallet-security.method-selector.generate-backup-codes")}
          </Button>
        </div>
      }
    >
      <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {t("wallet-security.method-selector.success-content", {
          method: securityMethod,
        })}
      </div>
    </OnboardingStepLayout>
  );
}
