import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function IdentityCreated() {
  const { t } = useTranslation(["common", "onboarding"]);
  const { data: identity } = useSuspenseQuery(
    orpc.system.identity.me.queryOptions()
  );
  const { completeStepAndNavigate } = useOnboardingNavigation();

  return (
    <FormStepLayout
      title={t("onboarding:identity-setup.success-title")}
      description={t("onboarding:identity-setup.success-message")}
      fullWidth={true}
      actions={
        <Button
          onClick={() =>
            void completeStepAndNavigate(
              OnboardingStep.identitySetup,
              OnboardingStep.identity
            )
          }
        >
          {t("onboarding:identity-setup.success-continue")}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-medium text-foreground">
            {t("onboarding:identity-setup.address-title")}
          </h3>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Web3Address
                address={identity.id}
                truncate={false}
                showPrettyName={false}
              />
            </div>
          </div>
        </div>
      </div>
    </FormStepLayout>
  );
}
