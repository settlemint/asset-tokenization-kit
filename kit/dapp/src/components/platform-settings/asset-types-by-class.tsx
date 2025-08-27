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
import { getAssetTypeFromFactoryTypeId } from "@atk/zod/asset-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AssetTypeActions } from "./asset-type-actions";
import { AssetTypeCard } from "./asset-type-card";
import {
  getAssetClassFromAssetType,
  getDefaultExtensions,
} from "./asset-types-constants";

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

                    const extensions =
                      factory?.tokenExtensions ||
                      getDefaultExtensions(assetType);

                    return (
                      <AssetTypeCard
                        key={assetType}
                        assetType={assetType}
                        extensions={extensions}
                      >
                        <AssetTypeActions
                          assetType={assetType}
                          isDeployed={isDeployed}
                          hasSystemManagerRole={hasSystemManagerRole}
                          isDeploying={isDeploying}
                          isDeployingThisType={
                            isDeploying && deployingAssetType === assetType
                          }
                          onEnable={handleEnableAssetType}
                          form={form}
                        />
                      </AssetTypeCard>
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
