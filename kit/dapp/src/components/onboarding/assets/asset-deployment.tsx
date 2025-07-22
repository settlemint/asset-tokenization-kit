import { AssetDeploymentSuccess } from "@/components/onboarding/assets/asset-deployment-success";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const logger = createLogger();

export function AssetDeployment() {
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "common"]);

  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: "default" },
    }),
  });

  // Stable reference for deployed factories
  const deployedFactories = systemDetails?.tokenFactories ?? [];

  const onNext = useCallback(async () => {
    try {
      await completeStepAndNavigate(OnboardingStep.systemAssets);
    } catch (error) {
      logger.error("Navigation error:", error);
      toast.error("Failed to navigate to next step");
    }
  }, [completeStepAndNavigate]);

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {t("assets.asset-types-deployed")}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {t("assets.your-asset-factories-ready")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <AssetDeploymentSuccess
            title={t("assets.asset-factories-deployed-successfully")}
            deployedFactoriesLabel={t("assets.deployed-factories")}
            factories={deployedFactories}
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-between">
          <Button type="button" onClick={onNext}>
            {t("common:continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}
