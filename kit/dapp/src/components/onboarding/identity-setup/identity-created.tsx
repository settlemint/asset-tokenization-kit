import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleCheckBigIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { zeroAddress } from "viem";

export function IdentityCreated() {
  const { t } = useTranslation(["common", "onboarding"]);
  const { data: account } = useSuspenseQuery(orpc.account.me.queryOptions());
  const { completeStepAndNavigate } = useOnboardingNavigation();

  return (
    <FormStepLayout
      title={t("onboarding:identity-setup.success-title")}
      description={t("onboarding:identity-setup.success-message")}
      actions={
        <Button
          onClick={() =>
            void completeStepAndNavigate(OnboardingStep.identitySetup)
          }
        >
          {t("common:continue")}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CircleCheckBigIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-base font-medium text-foreground">
            {t("onboarding:identity-setup.address-title")}
          </h3>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Web3Address
                address={account?.identity ?? zeroAddress}
                showPrettyName={false}
                showFullAddress
              />
            </div>
          </div>
        </div>
      </div>
    </FormStepLayout>
  );
}
