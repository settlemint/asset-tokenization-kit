import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { zeroAddress } from "viem";

export function WalletCreated() {
  const { t } = useTranslation(["common", "onboarding"]);
  const { data: user } = useSuspenseQuery(orpc.user.me.queryOptions());
  const { completeStepAndNavigate } = useOnboardingNavigation();

  // At this point in the onboarding flow, the user should always have a wallet
  // If they don't, something went wrong in the wallet creation process
  if (!user.wallet || user.wallet === zeroAddress) {
    throw new Error("User wallet not found after wallet creation step");
  }

  return (
    <FormStepLayout
      title={t("onboarding:wallet.created-title")}
      description={t("onboarding:wallet.success-message")}
      fullWidth={true}
      actions={
        <Button
          onClick={() => void completeStepAndNavigate(OnboardingStep.wallet)}
        >
          {t("onboarding:wallet.secure-wallet-button")}
        </Button>
      }
    >
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-foreground">
          {t("onboarding:wallet.wallet-address-title")}
        </h2>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Web3Address
              address={user.wallet}
              truncate
              copyToClipboard
              skipDataQueries // Skip queries during onboarding
            />
          </div>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>{t("onboarding:wallet.address-explanation")}</p>
          <p>{t("onboarding:wallet.security-importance")}</p>
          <p>{t("onboarding:wallet.security-next-steps")}</p>
        </div>
      </div>
    </FormStepLayout>
  );
}
