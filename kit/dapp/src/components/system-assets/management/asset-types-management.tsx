import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { AssetTypeCard } from "@/components/onboarding/assets/asset-type-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoAlert } from "@/components/ui/info-alert";
import { useAppForm } from "@/hooks/use-app-form";
import { orpc } from "@/orpc/orpc-client";
import {
  type FactoryCreateInput,
  FactoryCreateSchema,
  type SingleFactory,
  TokenTypeEnum,
} from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import {
  type AssetFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@atk/zod/asset-types";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function AssetTypesManagement() {
  const { t } = useTranslation(["onboarding", "common", "tokens"]);
  const queryClient = useQueryClient();

  // Fetch system details to see which asset types are deployed
  const { data: systemDetails, isLoading } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Get current user data with roles
  const { data: user } = useQuery(orpc.user.me.queryOptions());

  // Check if user has system manager role for enabling asset types
  const hasSystemManagerRole =
    user?.userSystemPermissions?.roles?.systemManager;

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

  const { mutateAsync: createFactories, isPending: isDeploying } = useMutation(
    orpc.system.factory.create.mutationOptions({
      onSuccess: async () => {
        // Refetch system data
        await queryClient.invalidateQueries({
          queryKey: orpc.system.read.key(),
        });
        // Clear selection
        form.setFieldValue("factories", []);
      },
    })
  );

  // Get selected factories from form state
  const selectedFactories = useStore(
    form.store,
    (state) => state.values.factories ?? []
  );

  const availableAssets = TokenTypeEnum.options;

  const handleToggleFactory = (
    assetType: typeof availableAssets[number],
    checked: boolean
  ) => {
    const currentFactories = form.getFieldValue("factories") ?? [];
    const factory: SingleFactory = {
      type: assetType,
      name: t(`asset-types.${assetType}`, { ns: "tokens" }),
    };

    if (checked) {
      form.setFieldValue("factories", [...currentFactories, factory]);
    } else {
      form.setFieldValue(
        "factories",
        currentFactories.filter((f) => f.type !== assetType)
      );
    }
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

  const hasUndeployedAssets = availableAssets.some(
    (asset) => !deployedAssetTypes.has(asset)
  );

  return (
    <form.AppForm>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("assets.available-asset-types")}</CardTitle>
            <CardDescription>
              {t("assets.select-all-asset-types")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasUndeployedAssets && (
              <InfoAlert
                description={t("assets.asset-factories-description")}
              />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableAssets.map((assetType) => {
                const Icon = getAssetIcon(assetType);
                const isDeployed = deployedAssetTypes.has(assetType);
                const isSelected = selectedFactories.some(
                  (f) => f.type === assetType
                );
                const isDisabled =
                  isDeploying ||
                  isDeployed ||
                  !hasSystemManagerRole;

                return (
                  <AssetTypeCard
                    key={assetType}
                    assetType={assetType}
                    icon={Icon}
                    isChecked={isSelected}
                    isDisabled={isDisabled}
                    onToggle={(checked) => {
                      if (!isDisabled) {
                        handleToggleFactory(assetType, checked);
                      }
                    }}
                  />
                );
              })}
            </div>

            {selectedFactories.length > 0 && hasSystemManagerRole && (
              <div className="flex justify-end pt-4 border-t">
                <form.VerificationButton
                  onSubmit={() => {
                    void form.handleSubmit();
                  }}
                  disabled={isDeploying || selectedFactories.length === 0}
                  walletVerification={{
                    title: t("assets.confirm-deployment-title"),
                    description: t("assets.confirm-deployment-description"),
                    setField: (verification) => {
                      form.setFieldValue("walletVerification", verification);
                    },
                  }}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("assets.deploying")}
                    </>
                  ) : selectedFactories.length > 1 ? (
                    `${t("assets.deploy")} (${selectedFactories.length})`
                  ) : (
                    t("assets.deploy")
                  )}
                </form.VerificationButton>
              </div>
            )}

            {!hasUndeployedAssets && (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("settings.assetTypes.allEnabled", { ns: "navigation" })}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show enabled asset types in a separate section */}
        {systemDetails?.tokenFactories &&
          systemDetails.tokenFactories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("settings.assetTypes.enabledTitle", { ns: "navigation" })}</CardTitle>
                <CardDescription>
                  {t("settings.assetTypes.enabledDescription", { ns: "navigation" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemDetails.tokenFactories.map((factory) => {
                    const assetType = getAssetTypeFromFactoryTypeId(
                      factory.typeId as AssetFactoryTypeId
                    );
                    const Icon = getAssetIcon(assetType);

                    return (
                      <div
                        key={factory.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {t(`asset-types.${assetType}`, { ns: "tokens" })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t(`assets.descriptions.${assetType}`)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </form.AppForm>
  );
}