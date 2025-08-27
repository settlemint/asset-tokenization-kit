import { AssetExtensionsList } from "@/components/asset-extensions/asset-extensions-list";
import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoAlert } from "@/components/ui/info-alert";
import { useAppForm } from "@/hooks/use-app-form";
import { useAssetClass } from "@/hooks/use-asset-class";
import { useAssetTypesData } from "@/hooks/use-asset-types-data";
import { orpc } from "@/orpc/orpc-client";
import {
  type FactoryCreateInput,
  FactoryCreateSchema,
  type SingleFactory,
  TokenTypeEnum,
} from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import { AssetExtensionEnum } from "@atk/zod/asset-extensions";
import { getAssetTypeFromFactoryTypeId } from "@atk/zod/asset-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

// Helper function to get asset class from asset type
function getAssetClassFromAssetType(
  assetType: (typeof TokenTypeEnum.options)[number]
) {
  const mapping = {
    bond: "fixedIncome" as const,
    equity: "flexibleIncome" as const,
    fund: "flexibleIncome" as const,
    stablecoin: "cashEquivalent" as const,
    deposit: "cashEquivalent" as const,
  };
  return mapping[assetType];
}

// Default extensions for each asset type (what they would have when enabled)
function getDefaultExtensions(
  assetType: (typeof TokenTypeEnum.options)[number]
) {
  const extensionsMap = {
    bond: [
      AssetExtensionEnum.ACCESS_MANAGED,
      AssetExtensionEnum.BOND,
      AssetExtensionEnum.CAPPED,
      AssetExtensionEnum.CUSTODIAN,
      AssetExtensionEnum.REDEEMABLE,
      AssetExtensionEnum.YIELD,
    ],
    equity: [
      AssetExtensionEnum.ACCESS_MANAGED,
      AssetExtensionEnum.CAPPED,
      AssetExtensionEnum.CUSTODIAN,
      AssetExtensionEnum.YIELD,
    ],
    fund: [
      AssetExtensionEnum.ACCESS_MANAGED,
      AssetExtensionEnum.FUND,
      AssetExtensionEnum.CAPPED,
      AssetExtensionEnum.CUSTODIAN,
      AssetExtensionEnum.REDEEMABLE,
      AssetExtensionEnum.YIELD,
    ],
    stablecoin: [
      AssetExtensionEnum.ACCESS_MANAGED,
      AssetExtensionEnum.CAPPED,
      AssetExtensionEnum.CUSTODIAN,
    ],
    deposit: [
      AssetExtensionEnum.ACCESS_MANAGED,
      AssetExtensionEnum.CAPPED,
      AssetExtensionEnum.CUSTODIAN,
      AssetExtensionEnum.REDEEMABLE,
      AssetExtensionEnum.YIELD,
    ],
  };
  return extensionsMap[assetType] || [];
}

export function AssetTypesByClass() {
  const { t } = useTranslation([
    "navigation",
    "tokens",
    "onboarding",
    "common",
    "errors",
    "asset-types",
    "asset-class",
    "asset-extensions",
  ]);
  const queryClient = useQueryClient();
  const { assetClasses, groupedFactories } = useAssetClass();

  const {
    systemDetails,
    hasSystemManagerRole,
    deployedAssetTypes,
    isLoading,
    isError,
  } = useAssetTypesData();

  const form = useAppForm({
    defaultValues: {
      factories: [] as FactoryCreateInput["factories"],
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE" as const,
      },
    } as FactoryCreateInput,
    onSubmit: ({ value }) => {
      if (!systemDetails?.tokenFactoryRegistry) {
        toast.error(t("assets.no-system", { ns: "onboarding" }));
        return;
      }
      const parsedValues = FactoryCreateSchema.parse(value);

      toast.promise(createFactories(parsedValues), {
        loading: t("assets.deploying-toast", { ns: "onboarding" }),
        success: t("assets.deployed", { ns: "onboarding" }),
        error: (error: Error) =>
          `${t("assets.failed-toast", { ns: "onboarding" })}${error.message}`,
      });
    },
  });

  const { mutateAsync: createFactories, isPending: isDeploying } = useMutation(
    orpc.system.factory.create.mutationOptions({
      onSuccess: async () => {
        // Refetch system data
        await queryClient.invalidateQueries({
          queryKey: orpc.system.read.key(),
        });
        // Clear selection and reset deploying state
        form.setFieldValue("factories", []);
        setDeployingAssetType(null);
      },
      onError: () => {
        // Reset deploying state on error
        setDeployingAssetType(null);
      },
    })
  );

  const [deployingAssetType, setDeployingAssetType] = useState<string | null>(
    null
  );

  const handleEnableAssetType = (
    assetType: (typeof TokenTypeEnum.options)[number]
  ) => {
    if (!hasSystemManagerRole) return;

    const factory: SingleFactory = {
      type: assetType,
      name: t(`types.${assetType}.name` as const, { ns: "asset-types" }),
    };

    form.setFieldValue("factories", [factory]);
    setDeployingAssetType(assetType);
    // Trigger submission which will show the verification dialog
    void form.handleSubmit();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex h-32 items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium">
              {t("errors.somethingWentWrong", { ns: "common" })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("buttons.tryAgain", { ns: "errors" })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const availableAssets = TokenTypeEnum.options;
  const hasUndeployedAssets = availableAssets.some(
    (asset) => !deployedAssetTypes.has(asset)
  );

  return (
    <form.AppForm>
      <div className="space-y-8">
        {hasUndeployedAssets && (
          <InfoAlert
            description={t("assets.asset-factories-description", {
              ns: "onboarding",
            })}
          />
        )}

        {assetClasses.map((assetClass) => {
          // Get ALL asset types for this class using our helper function
          const classAssetTypes = availableAssets.filter((assetType) => {
            return getAssetClassFromAssetType(assetType) === assetClass.id;
          });

          if (classAssetTypes.length === 0) return null;

          return (
            <Card key={assetClass.id}>
              <CardHeader>
                <div>
                  <CardTitle>{assetClass.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {assetClass.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {classAssetTypes.map((assetType) => {
                    const isDeployed = deployedAssetTypes.has(assetType);
                    const Icon = getAssetIcon(assetType);

                    // Get factory data with extensions from all deployed factories
                    const allFactories = [
                      ...groupedFactories.fixedIncome,
                      ...groupedFactories.flexibleIncome,
                      ...groupedFactories.cashEquivalent,
                    ];
                    const factory = allFactories.find(
                      (f) =>
                        getAssetTypeFromFactoryTypeId(f.typeId) === assetType
                    );

                    return (
                      <div
                        key={assetType}
                        className="flex items-start justify-between p-4 rounded-lg border bg-background"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <h4 className="text-base font-medium">
                                {t(`types.${assetType}.name`, {
                                  ns: "asset-types",
                                })}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {t(`types.${assetType}.description`, {
                                  ns: "asset-types",
                                })}
                              </p>
                            </div>
                          </div>
                          <AssetExtensionsList
                            extensions={
                              factory?.tokenExtensions ||
                              getDefaultExtensions(assetType)
                            }
                            className="mt-3"
                          />
                        </div>
                        <div className="ml-4 flex items-start">
                          {isDeployed ? (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 h-9 px-3 text-sm"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {t("settings.assetTypes.enabled", {
                                ns: "navigation",
                              })}
                            </Badge>
                          ) : (
                            hasSystemManagerRole && (
                              <form.VerificationButton
                                onSubmit={() => {
                                  handleEnableAssetType(assetType);
                                }}
                                disabled={isDeploying}
                                walletVerification={{
                                  title: t(
                                    "settings.assetTypes.confirmEnableTitle",
                                    {
                                      ns: "navigation",
                                      assetType: t(`types.${assetType}.name`, {
                                        ns: "asset-types",
                                      }),
                                    }
                                  ),
                                  description: t(
                                    "settings.assetTypes.confirmEnableDescription",
                                    { ns: "navigation" }
                                  ),
                                  setField: (verification) => {
                                    form.setFieldValue(
                                      "walletVerification",
                                      verification
                                    );
                                  },
                                }}
                              >
                                {isDeploying &&
                                deployingAssetType === assetType ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  t("settings.assetTypes.enable", {
                                    ns: "navigation",
                                  })
                                )}
                              </form.VerificationButton>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </form.AppForm>
  );
}
