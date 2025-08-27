import { getAddonTypeFromTypeId } from "@/components/system-addons/components/addon-types-mapping";
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
  type SystemAddonConfig,
  type SystemAddonCreateInput,
  SystemAddonCreateSchema,
} from "@/orpc/routes/system/addon/routes/addon.create.schema";
import { addonTypes } from "@atk/zod/addon-types";
import { AssetFactoryTypeIdEnum } from "@atk/zod/asset-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AddonActions } from "./addon-actions";
import { AddonCard } from "./addon-card";

export function AddonsManagement() {
  const { t } = useTranslation(["onboarding", "common"]);
  const queryClient = useQueryClient();

  // Fetch system details to see which addons are deployed
  const { data: systemDetails, isLoading } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );

  // Get current user data with roles
  const { data: user } = useQuery(orpc.user.me.queryOptions());

  // Check if user has system manager role for enabling addons
  const hasSystemManagerRole = Boolean(
    user?.userSystemPermissions?.roles?.systemManager
  );

  // Check if bond factory is deployed
  const hasBondFactory = useMemo(
    () =>
      systemDetails?.tokenFactories.some(
        (factory) => factory.typeId === AssetFactoryTypeIdEnum.ATKBondFactory
      ) ?? false,
    [systemDetails?.tokenFactories]
  );

  // Create a set of already deployed addons for easy lookup
  const deployedAddons = useMemo(
    () =>
      new Set(
        systemDetails?.systemAddons.map((addon) =>
          getAddonTypeFromTypeId(addon.typeId)
        ) ?? []
      ),
    [systemDetails?.systemAddons]
  );

  const form = useAppForm({
    defaultValues: {
      addons: [],
      walletVerification: {
        secretVerificationCode: "",
        verificationType: "PINCODE" as const,
      },
    } as SystemAddonCreateInput,
    onSubmit: ({ value }) => {
      if (!systemDetails?.systemAddonRegistry) {
        toast.error(t("system-addons.addon-selection.no-system"));
        return;
      }
      const parsedValues = SystemAddonCreateSchema.parse(value);

      toast.promise(createAddons(parsedValues), {
        loading: t("system-addons.addon-selection.deploying-toast"),
        success: t("system-addons.addon-selection.deployed-toast"),
        error: (error: Error) =>
          `${t("system-addons.addon-selection.failed-toast")}${error.message}`,
      });
    },
  });

  const { mutateAsync: createAddons, isPending: isDeploying } = useMutation(
    orpc.system.addon.create.mutationOptions({
      onSuccess: async () => {
        // Refetch system data
        await queryClient.invalidateQueries({
          queryKey: orpc.system.read.key(),
        });
        // Clear selection
        form.setFieldValue("addons", []);
      },
    })
  );

  // Auto-select yield if bond factory exists and yield isn't deployed
  useEffect(() => {
    if (hasBondFactory && !deployedAddons.has("yield")) {
      const currentAddons = form.getFieldValue("addons") ?? [];
      if (!currentAddons.some((a) => a.type === "yield")) {
        const yieldConfig: SystemAddonConfig = {
          type: "yield",
          name: t("system-addons.addon-selection.addon-types.yield.title"),
        };
        form.setFieldValue("addons", [...currentAddons, yieldConfig]);
      }
    }
  }, [hasBondFactory, deployedAddons, t, form]);

  const handleEnableAddon = (addonType: (typeof addonTypes)[number]) => {
    if (!hasSystemManagerRole) return;

    const addonConfig: SystemAddonConfig = {
      type: addonType,
      name: t(`system-addons.addon-selection.addon-types.${addonType}.title`),
    };

    form.setFieldValue("addons", [addonConfig]);
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

  const availableAddons = addonTypes;
  const hasUndeployedAddons = availableAddons.some(
    (addon) => !deployedAddons.has(addon)
  );

  return (
    <form.AppForm>
      <Card>
        <CardHeader>
          <CardTitle>
            {t("system-addons.addon-selection.available-addons")}
          </CardTitle>
          <CardDescription>
            Configure addon modules, integrations, and platform extensions. Once
            deployed, addons cannot be disabled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasUndeployedAddons && (
            <InfoAlert
              description={t("system-addons.addon-selection.intro-2")}
            />
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {availableAddons.map((addonType) => {
              const isDeployed = deployedAddons.has(addonType);
              const isYieldRequiredForBond =
                addonType === "yield" && hasBondFactory;

              return (
                <AddonCard key={addonType} addonType={addonType}>
                  <AddonActions
                    addonType={addonType}
                    isDeployed={isDeployed}
                    isRequired={isYieldRequiredForBond}
                    hasSystemManagerRole={hasSystemManagerRole}
                    isDeploying={isDeploying}
                    onEnable={handleEnableAddon}
                    form={form}
                  />
                </AddonCard>
              );
            })}
          </div>

          {!hasUndeployedAddons && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("system-addons.addon-selection.all-addons-enabled")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </form.AppForm>
  );
}
