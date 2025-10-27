import { getAddonIcon } from "@/components/system-addons/components/addon-icons";
import { AddonTypeCard } from "@/components/system-addons/components/addon-type-card";
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
import { useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const AVAILABLE_ADDONS = addonTypes.filter((type) => type === "yield");

export function AddonsManagement() {
  const { t } = useTranslation(["onboarding", "common"]);
  const queryClient = useQueryClient();

  // Fetch system details to see which addons are deployed
  const { data: systemDetails, isLoading } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
  );
  const system = systemDetails;

  // Check if user can create addons
  const canCreateAddon = system?.userPermissions?.actions.addonCreate;

  // Check if bond factory is deployed
  const hasBondFactory = useMemo(
    () =>
      system?.tokenFactoryRegistry.tokenFactories.some(
        (factory) => factory.typeId === AssetFactoryTypeIdEnum.ATKBondFactory
      ) ?? false,
    [system?.tokenFactoryRegistry.tokenFactories]
  );

  // Create a set of already deployed addons for easy lookup
  const deployedAddons = useMemo(
    () =>
      new Set(
        system?.systemAddonRegistry.systemAddons.map((addon) =>
          getAddonTypeFromTypeId(addon.typeId)
        )
      ),
    [system?.systemAddonRegistry.systemAddons]
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
        toast.error(t("onboarding:system-addons.addon-selection.no-system"));
        return;
      }
      const parsedValues = SystemAddonCreateSchema.parse(value);

      toast.promise(createAddons(parsedValues), {
        loading: t("onboarding:system-addons.addon-selection.deploying-toast"),
        success: t("onboarding:system-addons.addon-selection.deployed-toast"),
        error: (error: Error) =>
          `${t("onboarding:system-addons.addon-selection.failed-toast")}${error.message}`,
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

  // Get selected addons from form state
  const selectedAddons = useStore(
    form.store,
    (state) => state.values.addons ?? []
  );

  // Auto-select yield if bond factory exists and yield isn't deployed
  useEffect(() => {
    if (hasBondFactory && !deployedAddons.has("yield")) {
      const currentAddons = form.getFieldValue("addons") ?? [];
      if (!currentAddons.some((a) => a.type === "yield")) {
        const yieldConfig: SystemAddonConfig = {
          type: "yield",
          name: t(
            "onboarding:system-addons.addon-selection.addon-types.yield.title"
          ),
        };
        form.setFieldValue("addons", [...currentAddons, yieldConfig]);
      }
    }
  }, [hasBondFactory, deployedAddons, t, form]);

  const handleToggleAddon = (
    addonType: (typeof addonTypes)[number],
    checked: boolean
  ) => {
    const currentAddons = form.getFieldValue("addons") ?? [];
    const addonConfig: SystemAddonConfig = {
      type: addonType,
      name: t(
        `onboarding:system-addons.addon-selection.addon-types.${addonType}.title`
      ),
    };

    if (checked) {
      form.setFieldValue("addons", [...currentAddons, addonConfig]);
    } else {
      form.setFieldValue(
        "addons",
        currentAddons.filter((a) => a.type !== addonType)
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

  const hasUndeployedAddons = AVAILABLE_ADDONS.some(
    (addon) => !deployedAddons.has(addon)
  );

  return (
    <form.AppForm>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {t("onboarding:system-addons.addon-selection.available-addons")}
            </CardTitle>
            <CardDescription>
              {t("onboarding:system-addons.addon-selection.intro-1")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasUndeployedAddons && (
              <InfoAlert
                description={t(
                  "onboarding:system-addons.addon-selection.intro-2"
                )}
              />
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AVAILABLE_ADDONS.map((addonType) => {
                const Icon = getAddonIcon(addonType);
                const isDeployed = deployedAddons.has(addonType);
                const isSelected = selectedAddons.some(
                  (a) => a.type === addonType
                );
                const isYieldRequiredForBond =
                  addonType === "yield" && hasBondFactory;
                const isDisabled =
                  isDeploying ||
                  isDeployed ||
                  isYieldRequiredForBond ||
                  !canCreateAddon;

                return (
                  <AddonTypeCard
                    key={addonType}
                    addonType={addonType}
                    icon={Icon}
                    isChecked={isSelected}
                    isDisabled={isDisabled}
                    isRequired={isYieldRequiredForBond}
                    disabledLabel={
                      isYieldRequiredForBond
                        ? t(
                            "onboarding:system-addons.addon-selection.required-for-bonds"
                          )
                        : isDeployed
                          ? t("assets.deployed-label")
                          : undefined
                    }
                    onToggle={(checked) => {
                      handleToggleAddon(addonType, checked);
                    }}
                  />
                );
              })}
            </div>

            {selectedAddons.length > 0 && canCreateAddon && (
              <div className="flex justify-end pt-4 border-t">
                <form.VerificationButton
                  onSubmit={() => {
                    void form.handleSubmit();
                  }}
                  disabled={isDeploying || selectedAddons.length === 0}
                  walletVerification={{
                    title: t(
                      "onboarding:system-addons.addon-selection.confirm-deployment-title"
                    ),
                    description: t(
                      "onboarding:system-addons.addon-selection.confirm-deployment-description"
                    ),
                    setField: (verification) => {
                      form.setFieldValue("walletVerification", verification);
                    },
                  }}
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("onboarding:system-addons.addon-selection.deploying")}
                    </>
                  ) : selectedAddons.length > 1 ? (
                    `${t("onboarding:system-addons.addon-selection.deploy-addons")} (${selectedAddons.length})`
                  ) : (
                    t("onboarding:system-addons.addon-selection.deploy-addons")
                  )}
                </form.VerificationButton>
              </div>
            )}

            {!hasUndeployedAddons && (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  {t(
                    "onboarding:system-addons.addon-selection.all-addons-enabled"
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Show enabled addons in a separate section */}
        {system?.systemAddonRegistry.systemAddons &&
          system.systemAddonRegistry.systemAddons.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("onboarding:system-addons.addon-selection.enabled-addons")}
                </CardTitle>
                <CardDescription>
                  {t(
                    "onboarding:system-addons.addon-selection.enabled-addons-description"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {system.systemAddonRegistry.systemAddons.map((addon) => {
                    const addonType = getAddonTypeFromTypeId(addon.typeId);
                    const Icon = getAddonIcon(addonType);

                    return (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{addon.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t(
                                `onboarding:system-addons.addon-selection.addon-types.${addonType}.description`
                              )}
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
