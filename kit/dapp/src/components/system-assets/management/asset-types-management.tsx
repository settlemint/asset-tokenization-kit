import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoAlert } from "@/components/ui/info-alert";
import { useAppForm } from "@/hooks/use-app-form";
import { useAssetTypesData } from "@/hooks/use-asset-types-data";
import { orpc } from "@/orpc/orpc-client";
import {
  type FactoryCreateInput,
  FactoryCreateSchema,
  type SingleFactory,
  TokenTypeEnum,
} from "@/orpc/routes/system/token-factory/routes/factory.create.schema";
import { useStore } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AssetTypeSelectorCard } from "./asset-type-selector-card";
import { EnabledAssetTypes } from "./enabled-asset-types";

export function AssetTypesManagement() {
  const { t } = useTranslation(["onboarding", "common", "tokens", "navigation"]);
  const queryClient = useQueryClient();

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

  const handleToggleFactory = useCallback((
    assetType: typeof availableAssets[number],
    checked: boolean
  ) => {
    const currentFactories = form.getFieldValue("factories") ?? [];
    
    // Prevent duplicate asset types in factories array
    const existingFactoryIndex = currentFactories.findIndex(
      (f) => f.type === assetType
    );
    
    const factory: SingleFactory = {
      type: assetType,
      name: t(`asset-types.${assetType}`, { ns: "tokens" }),
    };

    if (checked && existingFactoryIndex === -1) {
      form.setFieldValue("factories", [...currentFactories, factory]);
    } else if (!checked && existingFactoryIndex !== -1) {
      form.setFieldValue(
        "factories",
        currentFactories.filter((f) => f.type !== assetType)
      );
    }
  }, [form, t]);

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
            <p className="text-red-600 font-medium">{t("errors.somethingWentWrong", { ns: "common" })}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please try again later
            </p>
          </div>
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
                const isDeployed = deployedAssetTypes.has(assetType);
                const isSelected = selectedFactories.some(
                  (f: typeof selectedFactories[number]) => f.type === assetType
                );

                return (
                  <AssetTypeSelectorCard
                    key={assetType}
                    assetType={assetType}
                    isSelected={isSelected}
                    isDeployed={isDeployed}
                    isDeploying={isDeploying}
                    hasSystemManagerRole={hasSystemManagerRole}
                    onToggle={handleToggleFactory}
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
        {!!systemDetails?.tokenFactories?.length && (
          <EnabledAssetTypes tokenFactories={systemDetails.tokenFactories} />
        )}
      </div>
    </form.AppForm>
  );
}