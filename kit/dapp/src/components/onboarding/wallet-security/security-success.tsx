import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { VerificationType } from "@atk/zod/validators/verification-type";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function SecuritySuccess() {
  const { t } = useTranslation(["onboarding", "general"]);
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());

  // Determine which security method was set up using the enum
  const hasOtp = user.verificationTypes.includes(VerificationType.otp);
  const hasPincode = user.verificationTypes.includes(VerificationType.pincode);

  // Handle unexpected states - default to pincode if neither is set
  let securityMethod: string;
  if (hasOtp) {
    securityMethod = t(
      "wallet-security.method-selector.security-methods.one-time-password"
    );
  } else if (hasPincode) {
    securityMethod = t(
      "wallet-security.method-selector.security-methods.pin-code"
    );
  } else {
    // This should not happen in normal flow, but handle it gracefully
    // Default to pincode as it's the most common method
    securityMethod = t(
      "wallet-security.method-selector.security-methods.pin-code"
    );
  }

  return (
    <FormStepLayout
      title={t("wallet-security.method-selector.success")}
      description={t("wallet-security.method-selector.success-description")}
      fullWidth={true}
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
    </FormStepLayout>
  );
}
