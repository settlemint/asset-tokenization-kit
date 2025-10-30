import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { AssetTypeCard } from "@/components/platform-settings/asset-types/asset-type-card";
import {
  getAssetClassFromAssetType,
  getDefaultExtensions,
} from "@/components/platform-settings/asset-types/asset-types-constants";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { InfoAlert } from "@/components/ui/info-alert";
import { WarningAlert } from "@/components/ui/warning-alert";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import {
  type FactoryCreateInput,
  FactoryCreateSchema,
  TokenTypeEnum,
} from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import { getAssetTypeFromFactoryTypeId } from "@atk/zod/asset-types";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const ASSET_CLASS_ORDER = [
  "fixedIncome",
  "flexibleIncome",
  "cashEquivalent",
] as const;

export function AssetTypeSelection() {
  const { refreshUserState, completeStepAndNavigate } =
    useOnboardingNavigation();
  const { t } = useTranslation([
    "onboarding",
    "common",
    "tokens",
    "errors",
    "asset-class",
  ]);
  const queryClient = useQueryClient();

  const { data: systemDetails, isError: systemError } = useQuery(
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
      orpc.system.factory.create.mutationOptions({
        onSuccess: async () => {
          // Refetch all relevant data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: orpc.system.read.key() }),
            queryClient.invalidateQueries({
              queryKey: orpc.system.read.queryKey({
                input: { id: "default" },
              }),
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
  type AssetType = (typeof availableAssets)[number];

  const groupedAssetTypes = useMemo(() => {
    const groups: Record<(typeof ASSET_CLASS_ORDER)[number], AssetType[]> = {
      fixedIncome: [],
      flexibleIncome: [],
      cashEquivalent: [],
    };

    availableAssets.forEach((assetType) => {
      const assetClass = getAssetClassFromAssetType(assetType);
      groups[assetClass].push(assetType);
    });

    return groups;
  }, [availableAssets]);

  const assetClassSections = useMemo(
    () =>
      ASSET_CLASS_ORDER.map((assetClass) => ({
        id: assetClass,
        title: t(`categories.${assetClass}.name`, { ns: "asset-class" }),
        description: t(`categories.${assetClass}.description`, {
          ns: "asset-class",
        }),
        assets: groupedAssetTypes[assetClass],
      })),
    [groupedAssetTypes, t]
  );

  // Create a set of already deployed asset types for easy lookup
  const deployedAssetTypes = useMemo(
    () =>
      new Set(
        (systemDetails?.tokenFactoryRegistry.tokenFactories ?? []).map(
          (factory) => getAssetTypeFromFactoryTypeId(factory.typeId)
        )
      ),
    [systemDetails?.tokenFactoryRegistry.tokenFactories]
  );

  const factories = useStore(form.store, (state) => state.values.factories);

  if (systemError) {
    return (
      <FormStepLayout
        title={t("assets.title")}
        description={t("errors.somethingWentWrong", { ns: "common" })}
        fullWidth={true}
      >
        <div className="text-center py-12">
          <p className="text-red-600 font-medium mb-2">
            {t("errors.somethingWentWrong", { ns: "common" })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("buttons.tryAgain", { ns: "errors" })}
          </p>
        </div>
      </FormStepLayout>
    );
  }

  return (
    <form.AppForm>
      <FormStepLayout
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
              walletVerification={{
                title: t("assets.confirm-deployment-title"),
                description: t("assets.confirm-deployment-description"),
                setField: (verification) => {
                  form.setFieldValue("walletVerification", verification);
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
                      <div className="space-y-6">
                        {assetClassSections.map((section) => {
                          if (section.assets.length === 0) {
                            return null;
                          }

                          return (
                            <Card key={section.id}>
                              <CardHeader>
                                <CardTitle>{section.title}</CardTitle>
                                <CardDescription>
                                  {section.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 auto-rows-fr">
                                  {section.assets.map((assetType) => {
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

                                      const currentFactories =
                                        field.state.value ?? [];

                                      if (checked) {
                                        const alreadySelected =
                                          currentFactories.some(
                                            (factory) =>
                                              factory.type === assetType
                                          );
                                        if (alreadySelected) {
                                          return;
                                        }

                                        const nextFactories = [
                                          ...currentFactories,
                                          {
                                            type: assetType,
                                            name: t(
                                              `asset-types.${assetType}`,
                                              {
                                                ns: "tokens",
                                              }
                                            ),
                                          },
                                        ];
                                        field.handleChange(nextFactories);
                                      } else {
                                        const nextFactories =
                                          currentFactories.filter(
                                            (factory) =>
                                              factory.type !== assetType
                                          );
                                        field.handleChange(nextFactories);
                                      }
                                    };

                                    const toggleSelection = () => {
                                      handleToggle(!isChecked);
                                    };

                                    const assetDisplayName = t(
                                      `asset-types.${assetType}`,
                                      { ns: "tokens" }
                                    );

                                    return (
                                      <div
                                        key={assetType}
                                        className="relative h-full"
                                      >
                                        <AssetTypeCard
                                          assetType={assetType}
                                          extensions={getDefaultExtensions(
                                            assetType
                                          )}
                                          className="h-full"
                                        >
                                          {isDisabled ? (
                                            <Badge
                                              variant="outline"
                                              className="flex h-9 items-center gap-1 px-3 text-sm"
                                            >
                                              <CheckCircle2 className="h-3 w-3" />
                                              {t("assets.deployed-label")}
                                            </Badge>
                                          ) : (
                                            <div className="h-9" />
                                          )}
                                        </AssetTypeCard>
                                        <div
                                          className={cn(
                                            "pointer-events-none absolute inset-0 rounded-lg border-2 transition-colors",
                                            isChecked
                                              ? "border-primary bg-primary/5"
                                              : "border-transparent"
                                          )}
                                        />
                                        <button
                                          type="button"
                                          onClick={toggleSelection}
                                          disabled={isDisabled}
                                          aria-pressed={isChecked}
                                          aria-label={`${isChecked ? "Deselect" : "Select"} ${assetDisplayName}`}
                                          className={cn(
                                            "absolute inset-0 rounded-lg bg-transparent",
                                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                                            isDisabled
                                              ? "cursor-not-allowed"
                                              : "cursor-pointer hover:ring-2 hover:ring-primary/30"
                                          )}
                                        >
                                          <span className="sr-only">
                                            {`${isChecked ? "Deselect" : "Select"} ${assetDisplayName}`}
                                          </span>
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
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
      </FormStepLayout>
    </form.AppForm>
  );
}
