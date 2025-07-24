import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { AssetTypeCard } from "@/components/onboarding/assets/asset-type-card";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
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
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AssetSelectionFormValues {
  assets: TokenType[];
}

const logger = createLogger();

export function AssetTypeSelection() {
  const { refreshUserState } = useOnboardingNavigation();
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
            `Failed to deploy asset factories: ${error.message}`,
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
    >
      <div className="max-w-2xl space-y-6">
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
              <form.Field
                name="assets"
                validators={{
                  onChange: ({ value }) => {
                    if (value.length === 0) {
                      return t("assets.validation-error");
                    }
                    return undefined;
                  },
                }}
              >
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
                              field.handleChange([
                                ...field.state.value,
                                assetType,
                              ]);
                            } else {
                              field.handleChange(
                                field.state.value.filter(
                                  (value: string) => value !== assetType
                                )
                              );
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

          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex justify-between">
              <Button type="submit" disabled={isFactoriesCreating}>
                {t("assets.deploy-assets")}
              </Button>
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
