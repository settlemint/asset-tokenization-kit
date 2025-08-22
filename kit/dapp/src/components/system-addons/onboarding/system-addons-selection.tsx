import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { getAddonIcon } from "@/components/system-addons/components/addon-icons";
import { AddonTypeCard } from "@/components/system-addons/components/addon-type-card";
import { getAddonTypeFromTypeId } from "@/components/system-addons/components/addon-types-mapping";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { WarningAlert } from "@/components/ui/warning-alert";
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
import { useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function SystemAddonsSelection() {
  const { refreshUserState } = useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "common"]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: systemDetails } = useQuery(
    orpc.system.read.queryOptions({
      input: { id: "default" },
    })
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
  const deployedAddonsConfig = useMemo(() => {
    return [...deployedAddons].map((addon) => ({
      type: addon,
      name: t(`system-addons.addon-selection.addon-types.${addon}.title`),
    }));
  }, [deployedAddons, t]);

  const form = useAppForm({
    defaultValues: {
      addons: hasBondFactory
        ? [
            {
              type: "yield",
              name: t(`system-addons.addon-selection.addon-types.yield.title`),
            },
            ...deployedAddonsConfig,
          ]
        : deployedAddonsConfig,
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

  const { mutateAsync: createAddons, isPending: isAddonsCreating } =
    useMutation(
      orpc.system.addon.create.mutationOptions({
        onSuccess: async () => {
          // Reset the skip setting since user deployed addons
          await updateSetting({
            key: "SYSTEM_ADDONS_SKIPPED",
            value: "false",
          });
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

  const { mutateAsync: updateSetting } = useMutation(
    orpc.settings.upsert.mutationOptions()
  );

  const availableAddons = addonTypes;

  const handleAddAddon = (addon: SystemAddonConfig) => {
    const alreadyIncluded = form.state.values.addons.some(
      (a) => a.type === addon.type
    );
    if (alreadyIncluded) {
      return;
    }
    form.setFieldValue("addons", [...form.state.values.addons, addon]);
  };
  const handleRemoveAddon = (addon: SystemAddonConfig) => {
    form.setFieldValue(
      "addons",
      form.state.values.addons.filter((a) => a.type !== addon.type)
    );
  };

  const addons = useStore(form.store, (state) => state.values.addons);

  return (
    <form.AppForm>
      <FormStepLayout
        title={t("system-addons.addon-selection.title")}
        description={t("system-addons.addon-selection.description")}
        fullWidth={true}
        actions={
          <>
            {/* Only show Skip button if yield is not required */}
            {!hasBondFactory && (
              <Button
                variant="outline"
                onClick={async () => {
                  // Save that the user skipped system addons
                  await updateSetting({
                    key: "SYSTEM_ADDONS_SKIPPED",
                    value: "true",
                  });
                  await refreshUserState();
                  void navigate({ to: "/onboarding" });
                }}
              >
                {t("common:actions.skip")}
              </Button>
            )}

            <form.VerificationButton
              onSubmit={() => {
                void form.handleSubmit();
              }}
              disabled={isAddonsCreating || addons.length === 0}
              walletVerification={{
                title: t(
                  "system-addons.addon-selection.confirm-deployment-title"
                ),
                description: t(
                  "system-addons.addon-selection.confirm-deployment-description"
                ),
                setField: (verification) => {
                  form.setFieldValue("walletVerification", verification);
                },
              }}
            >
              {isAddonsCreating
                ? t("system-addons.addon-selection.deploying")
                : t("system-addons.addon-selection.deploy-addons")}
            </form.VerificationButton>
          </>
        }
      >
        <div className="space-y-6">
          <WarningAlert
            description={t("system-addons.addon-selection.deployment-warning")}
          />

          <div className="space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("system-addons.addon-selection.intro-1")}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t("system-addons.addon-selection.intro-2")}
            </p>
          </div>

          <InfoAlert
            description={t(
              "system-addons.addon-selection.transaction-confirmation-info"
            )}
          />

          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="space-y-6">
                <form.Field
                  name="addons"
                  validators={{
                    onChange: ({ value }) => {
                      // Don't validate if bond factory requires yield and it's selected
                      const isYieldSelected = value.some(
                        (addon) => addon.type === "yield"
                      );
                      if (hasBondFactory && isYieldSelected) {
                        return undefined;
                      }
                      // Otherwise require at least one addon
                      if (value.length === 0) {
                        return t(
                          "system-addons.addon-selection.validation.invalid"
                        );
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
                            {t(
                              "system-addons.addon-selection.available-addons"
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {t(
                              "system-addons.addon-selection.select-all-addons"
                            )}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {availableAddons.map((addon) => {
                            const Icon = getAddonIcon(addon);
                            const isYieldRequiredForBond =
                              addon === "yield" && hasBondFactory;
                            const isAlreadyDeployed = deployedAddons.has(addon);
                            const isDisabled =
                              isAddonsCreating ||
                              isAlreadyDeployed ||
                              isYieldRequiredForBond;
                            const isChecked = field.state.value.some(
                              (a) => a.type === addon
                            );

                            const handleToggle = (checked: boolean) => {
                              if (isDisabled) {
                                return;
                              }

                              const addonConfig = {
                                type: addon,
                                name: t(
                                  `system-addons.addon-selection.addon-types.${addon}.title`
                                ),
                              };

                              if (checked) {
                                handleAddAddon(addonConfig);
                              } else {
                                handleRemoveAddon(addonConfig);
                              }
                            };

                            return (
                              <AddonTypeCard
                                key={addon}
                                addonType={addon}
                                icon={Icon}
                                isChecked={isChecked}
                                isDisabled={isDisabled}
                                disabledLabel={
                                  isYieldRequiredForBond
                                    ? t(
                                        "system-addons.addon-selection.required-for-bonds"
                                      )
                                    : isAlreadyDeployed
                                      ? t("assets.deployed-label")
                                      : undefined
                                }
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
          </div>
        </div>
      </FormStepLayout>
    </form.AppForm>
  );
}
