import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { AssetDeploymentSuccess } from "@/components/onboarding/assets/asset-deployment-success";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const logger = createLogger();

export function AssetDeployment() {
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "common"]);
  const navigate = useNavigate();
  const { data: systemDetails } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Stable reference for deployed factories
  const deployedFactories =
    systemDetails?.tokenFactoryRegistry.tokenFactories ?? [];

  const queryClient = useQueryClient();

  const onNext = useCallback(async () => {
    try {
      // Invalidate token factory list to update sidebar
      await queryClient.invalidateQueries({
        queryKey: orpc.system.factory.list.queryKey({
          input: { hasTokens: true },
        }),
        refetchType: "all",
      });
      await completeStepAndNavigate(OnboardingStep.systemAssets);
    } catch (error) {
      logger.error("Navigation error:", error);
      toast.error("Failed to navigate to next step");
    }
  }, [completeStepAndNavigate, queryClient]);

  return (
    <FormStepLayout
      title={t("assets.asset-types-deployed")}
      description={t("assets.your-asset-factories-ready")}
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => {
              void navigate({ to: "/onboarding" });
            }}
          >
            {t("common:cancel")}
          </Button>

          <Button type="button" onClick={onNext} className="press-effect">
            {t("common:continue")}
          </Button>
        </>
      }
    >
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          <AssetDeploymentSuccess
            title={t("assets.asset-factories-deployed-successfully")}
            deployedFactoriesLabel={t("assets.deployed-factories")}
            factories={deployedFactories}
          />
        </div>
      </div>
    </FormStepLayout>
  );
}
