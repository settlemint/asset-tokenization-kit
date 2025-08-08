import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { AssetTypeCard } from "@/components/onboarding/assets/asset-type-card";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { InfoAlert } from "@/components/ui/info-alert";
import { WarningAlert } from "@/components/ui/warning-alert";
import { useAppForm } from "@/hooks/use-app-form";
import {
  type AssetFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import {
  FactoryCreateInput,
  FactoryCreateSchema,
  type SingleFactory,
  TokenTypeEnum,
} from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function AssetTypeSelection() {
  const { refreshUserState, completeStepAndNavigate } =
    useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "common", "tokens"]);
  const queryClient = useQueryClient();

  const { data: systemDetails } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  const form = useAppForm({
    defaultValues: {
      factories: [] as FactoryCreateInput["factories"],
    } as FactoryCreateInput,

    onSubmit: ({ value }) => {
      if (!systemDetails?.tokenFactoryRegistry) {
        toast.error(t("assets.no-system"));
        return;
      }
      const parsedValues = FactoryCreateSchema.parse(value);
      toast.promise(createFactories(parsedValues), {
        loading: t("assets.deploying-toast"),
        success: t("assets.deployed"),
        error: (error: Error) => `${t("assets.failed-toast")}${error.message}`,
      });
    },
  });

  const { mutateAsync: createFactories, isPending: isFactoriesCreating } =
    useMutation(
      orpc.system.tokenFactoryCreate.mutationOptions({
        onSuccess: async () => {
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

  const handleAddFactory = (factory: SingleFactory) => {
    const alreadyIncluded = form.state.values.factories.some(
      (f) => f.type === factory.type
    );
    if (alreadyIncluded) {
      return;
    }
    form.setFieldValue("factories", [...form.state.values.factories, factory]);
  };

  const handleRemoveFactory = (factory: SingleFactory) => {
    form.setFieldValue(
      "factories",
      form.state.values.factories.filter((f) => f.type !== factory.type)
    );
  };
  const factories = useStore(form.store, (state) => state.values.factories);

  return (
    <form.AppForm>
      <OnboardingStepLayout
        title={t("assets.title")}
        description={t("assets.choose-asset-types")}
        fullWidth={true}
        actions={
          <div className="flex justify-end w-full">
            <form.VerificationButton
              onSubmit={() => {
                void form.handleSubmit();
              }}
              disabled={isFactoriesCreating || factories.length === 0}
              verification={{
                title: t("assets.confirm-deployment-title"),
                description: t("assets.confirm-deployment-description"),
                setField: (verification) => {
                  form.setFieldValue("verification", verification);
                },
              }}
            >
              {isFactoriesCreating ? t("assets.deploying") : t("assets.deploy")}
            </form.VerificationButton>
          </div>
        }
      >
        <div className="space-y-6">
          <WarningAlert description={t("assets.deployment-warning")} />

          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("assets.factory-explanation-1")}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("assets.factory-explanation-2")}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("assets.factory-explanation-3")}
            </p>
          </div>

          <InfoAlert description={t("assets.asset-factories-description")} />

          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {t("assets.available-asset-types")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("assets.select-all-asset-types")}
                  </p>
                </div>
                <form.Field name="factories">
                  {(field) => (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {availableAssets.map((assetType) => {
                          const Icon = getAssetIcon(assetType);
                          const isDisabled =
                            deployedAssetTypes.has(assetType) ||
                            isFactoriesCreating;
                          const isChecked = field.state.value.some(
                            (factory) => factory.type === assetType
                          );

                          const handleToggle = (checked: boolean) => {
                            if (isDisabled) {
                              return;
                            }

                            if (checked) {
                              handleAddFactory({
                                type: assetType,
                                name: t(`asset-types.${assetType}`, {
                                  ns: "tokens",
                                }),
                              });
                            } else {
                              handleRemoveFactory({
                                type: assetType,
                                name: t(`asset-types.${assetType}`, {
                                  ns: "tokens",
                                }),
                              });
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

                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          </div>
        </div>
      </OnboardingStepLayout>
    </form.AppForm>
  );
}
