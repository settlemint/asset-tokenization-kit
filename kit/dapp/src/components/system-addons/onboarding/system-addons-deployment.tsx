import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { getAddonIcon } from "@/components/system-addons/components/addon-icons";
import { getAddonTypeFromTypeId } from "@/components/system-addons/components/addon-types-mapping";
import { Button } from "@/components/ui/button";
import { orpc } from "@/orpc/orpc-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const logger = createLogger();

export function SystemAddonsDeployment() {
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "common"]);

  const { data: systemDetails } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Stable reference for deployed addons
  const deployedAddons = systemDetails?.systemAddons ?? [];

  const queryClient = useQueryClient();

  const onNext = useCallback(async () => {
    try {
      // Invalidate system data to update any components that depend on system addons
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orpc.system.read.queryKey({ input: { id: "default" } }),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: orpc.user.me.queryKey(),
          refetchType: "all",
        }),
      ]);
      await completeStepAndNavigate(OnboardingStep.systemAddons);
    } catch (error) {
      logger.error("Navigation error:", error);
      toast.error("Failed to navigate to next step");
    }
  }, [completeStepAndNavigate, queryClient]);

  return (
    <FormStepLayout
      title={t("system-addons.addon-deployment.title")}
      description={t("system-addons.addon-deployment.description")}
      fullWidth={true}
      actions={
        <Button type="button" onClick={onNext} className="press-effect">
          {t("system-addons.addon-deployment.continue-to-identity-setup")}
        </Button>
      }
    >
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6">
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
            <p>{t("system-addons.addon-deployment.intro-1")}</p>
            <p>{t("system-addons.addon-deployment.intro-2")}</p>
          </div>
          <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium text-green-800 dark:text-green-300">
                {t(
                  "system-addons.addon-deployment.addons-deployed-successfully"
                )}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                {t("system-addons.addon-deployment.deployed-addons")}
              </p>
              <div className="grid gap-2">
                {deployedAddons.map((addon) => {
                  const IconComponent = getAddonIcon(
                    getAddonTypeFromTypeId(addon.typeId)
                  );
                  return (
                    <div
                      key={addon.id}
                      className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium">{addon.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormStepLayout>
  );
}
