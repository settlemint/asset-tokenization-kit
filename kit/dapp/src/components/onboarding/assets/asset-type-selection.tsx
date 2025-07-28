import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { AssetTypeCard } from "@/components/onboarding/assets/asset-type-card";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { useAppForm } from "@/hooks/use-app-form";
import {
  type AssetFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import {
  type TokenType,
  TokenTypeEnum,
} from "@/orpc/routes/token/routes/factory/factory.create.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AssetSelectionFormValues {
  assets: TokenType[];
}

const logger = createLogger();

export function AssetTypeSelection() {
  const { refreshUserState, completeStepAndNavigate } =
    useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "common", "tokens"]);
  const queryClient = useQueryClient();
  // Verification dialog state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [pendingFactories, setPendingFactories] = useState<
    | {
        type: TokenType;
        name: string;
      }[]
    | null
  >(null);

  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: "default" },
    }),
  });

  const form = useAppForm({
    defaultValues: {
      assets: [] as TokenType[],
    },
    onSubmit: ({ value }: { value: AssetSelectionFormValues }) => {
      if (!systemDetails?.tokenFactoryRegistry) {
        toast.error(t("assets.no-system"));
        return;
      }

      const factories = value.assets.map((assetType) => ({
        type: assetType,
        name: t(`asset-types.${assetType}`, { ns: "tokens" }),
      }));

      // Store the factories and show the verification dialog
      setPendingFactories(factories);
      setVerificationError(null);
      setShowVerificationModal(true);
    },
  });

  const { mutateAsync: createFactories, isPending: isFactoriesCreating } =
    useMutation(
      orpc.token.factoryCreate.mutationOptions({
        onSuccess: async (result) => {
          for await (const event of result) {
            logger.info("token factory deployment event", event);
            if (event.status === "failed") {
              throw new Error(event.message);
            }
          }
          // Refetch all relevant data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: orpc.system.read.key() }),
            queryClient.invalidateQueries({
              queryKey: orpc.system.read.queryOptions({
                input: { id: "default" },
              }).queryKey,
              refetchType: "all",
            }),
          ]);
          await refreshUserState();
          // Navigate to next step after successful deployment
          await completeStepAndNavigate(OnboardingStep.systemAssets);
        },
      })
    );

  // Handle verification code submission
  const handleVerificationSubmit = useCallback(
    (verification: UserVerification) => {
      if (!pendingFactories || !systemDetails?.tokenFactoryRegistry) {
        return;
      }

      setVerificationError(null);
      setShowVerificationModal(false);

      toast.promise(
        createFactories({
          verification,
          contract: systemDetails.tokenFactoryRegistry,
          factories: pendingFactories,
        }),
        {
          loading: t("assets.deploying-toast"),
          success: t("assets.deployed"),
          error: (error: Error) =>
            `${t("assets.failed-toast")}${error.message}`,
        }
      );
    },
    [pendingFactories, systemDetails?.tokenFactoryRegistry, createFactories, t]
  );

  const availableAssets = TokenTypeEnum.options;

  // Create a set of already deployed asset types for easy lookup
  const deployedAssetTypes = useMemo(
    () =>
      new Set(
        systemDetails?.tokenFactories.map((factory) =>
          getAssetTypeFromFactoryTypeId(factory.typeId as AssetFactoryTypeId)
        ) ?? []
      ),
    [systemDetails?.tokenFactories]
  );

  return (
    <OnboardingStepLayout
      title={t("assets.select-asset-types")}
      description={t("assets.choose-asset-types")}
      actions={
        <div className="flex justify-end w-full">
          <form.Subscribe>
            {() => (
              <Button
                type="button"
                onClick={() => {
                  void form.handleSubmit();
                }}
                disabled={
                  isFactoriesCreating ||
                  !form.state.values.assets ||
                  form.state.values.assets.length === 0
                }
              >
                {isFactoriesCreating
                  ? t("assets.deploying")
                  : t("assets.deploy")}
              </Button>
            )}
          </form.Subscribe>
        </div>
      }
    >
      <div className="max-w-2xl space-y-6">
        <div className="rounded-lg bg-sm-state-warning-background/50 border border-sm-state-warning-background p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="h-5 w-5 text-sm-state-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-sm-state-warning">
                {t("assets.deployment-warning")}
              </p>
            </div>
          </div>
        </div>

        <InfoAlert
          title={t("assets.what-are-asset-factories")}
          description={t("assets.asset-factories-description")}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col h-full"
        >
          <div className="flex-1">
            <div className="space-y-6">
              <form.Field name="assets">
                {(field) => (
                  <>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {t("assets.available-asset-types")}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("assets.select-all-asset-types")}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {availableAssets.map((assetType) => {
                          const Icon = getAssetIcon(assetType);
                          const isDisabled =
                            deployedAssetTypes.has(assetType) ||
                            isFactoriesCreating;
                          const isChecked =
                            field.state.value.includes(assetType) || isDisabled;

                          const handleToggle = (checked: boolean) => {
                            if (isDisabled) {
                              return;
                            }

                            if (checked) {
                              const newValue = [
                                ...field.state.value,
                                assetType,
                              ];
                              field.handleChange(newValue);
                            } else {
                              const newValue = field.state.value.filter(
                                (value: string) => value !== assetType
                              );
                              field.handleChange(newValue);
                            }
                          };

                          return (
                            <AssetTypeCard
                              key={assetType}
                              assetType={assetType}
                              icon={Icon}
                              isChecked={isChecked}
                              isDisabled={isDisabled}
                              onToggle={handleToggle}
                            />
                          );
                        })}
                      </div>
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>
          </div>
        </form>
      </div>

      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={handleVerificationSubmit}
        title={t("assets.confirm-deployment-title")}
        description={t("assets.confirm-deployment-description")}
        errorMessage={verificationError}
      />
    </OnboardingStepLayout>
  );
}
