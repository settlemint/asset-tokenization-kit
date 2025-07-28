import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { getAddonIcon } from "@/components/onboarding/system-addons/addon-icons";
import { AddonTypeCard } from "@/components/onboarding/system-addons/addon-type-card";
import { getAddonTypeFromTypeId } from "@/components/onboarding/system-addons/addon-types-mapping";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { useAppForm } from "@/hooks/use-app-form";
import { addonTypes, type AddonType } from "@/lib/zod/validators/addon-types";
import { AssetFactoryTypeIdEnum } from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import type { UserVerification } from "@/orpc/routes/common/schemas/user-verification.schema";
import type { SystemAddonType } from "@/orpc/routes/system/routes/system.addonCreate.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface SystemAddonsSelectionFormValues {
  addons: AddonType[];
}

const logger = createLogger();

export function SystemAddonsSelection() {
  const { refreshUserState } = useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "common"]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Verification dialog state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [pendingAddons, setPendingAddons] = useState<
    | {
        type: SystemAddonType;
        name: string;
      }[]
    | null
  >(null);

  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: "default" },
    }),
  });

  // Check if bond factory is deployed
  const hasBondFactory = useMemo(
    () =>
      systemDetails?.tokenFactories.some(
        (factory) => factory.typeId === AssetFactoryTypeIdEnum.ATKBondFactory
      ) ?? false,
    [systemDetails?.tokenFactories]
  );

  const form = useAppForm({
    defaultValues: {
      addons: hasBondFactory ? ["yield"] : ([] as SystemAddonType[]),
    },
    onSubmit: ({ value }: { value: SystemAddonsSelectionFormValues }) => {
      if (!systemDetails?.systemAddonRegistry) {
        toast.error(t("system-addons.addon-selection.no-system"));
        return;
      }

      const addons = value.addons.map((addon) => ({
        type: addon,
        name: t(`system-addons.addon-selection.addon-types.${addon}.title`),
      }));

      // Store the addons and show the verification dialog
      setPendingAddons(addons);
      setVerificationError(null);
      setShowVerificationModal(true);
    },
  });

  const { mutateAsync: createAddons, isPending: isAddonsCreating } =
    useMutation(
      orpc.system.addonCreate.mutationOptions({
        onSuccess: async (result) => {
          for await (const event of result) {
            logger.info("system addon deployment event", event);
            if (event.status === "failed") {
              throw new Error(event.message);
            }
          }
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

  // Handle verification code submission
  const handleVerificationSubmit = useCallback(
    (verification: UserVerification) => {
      if (!pendingAddons || !systemDetails?.systemAddonRegistry) {
        return;
      }

      setVerificationError(null);
      setShowVerificationModal(false);

      toast.promise(
        createAddons({
          verification,
          contract: systemDetails.systemAddonRegistry,
          addons: pendingAddons,
        }),
        {
          loading: t("system-addons.addon-selection.deploying-toast"),
          success: t("system-addons.addon-selection.deployed-toast"),
          error: (error: Error) =>
            `${t("system-addons.addon-selection.failed-toast")}${error.message}`,
        }
      );
    },
    [pendingAddons, createAddons, t, systemDetails?.systemAddonRegistry]
  );

  const availableAddons = addonTypes;

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

  return (
    <OnboardingStepLayout
      title={t("system-addons.addon-selection.title")}
      description={t("system-addons.addon-selection.description")}
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

          <Button
            type="button"
            onClick={() => {
              void form.handleSubmit();
            }}
            disabled={isAddonsCreating || form.state.values.addons.length === 0}
          >
            {isAddonsCreating
              ? t("system-addons.addon-selection.deploying")
              : t("system-addons.addon-selection.deploy-addons")}
          </Button>
        </>
      }
    >
      <div className="max-w-2xl space-y-6">
        <InfoAlert
          title={t("system-addons.addon-selection.what-are-addons")}
          description={t("system-addons.addon-selection.addons-description")}
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
                name="addons"
                validators={{
                  onChange: ({ value }) => {
                    // Don't validate if bond factory requires yield and it's selected
                    if (hasBondFactory && value.includes("yield")) {
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
                          {t("system-addons.addon-selection.available-addons")}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {t("system-addons.addon-selection.select-all-addons")}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {availableAddons.map((addon) => {
                          const Icon = getAddonIcon(addon);
                          const isYieldRequiredForBond =
                            addon === "yield" && hasBondFactory;
                          const isAlreadyDeployed = deployedAddons.has(addon);
                          const isDisabled =
                            isAlreadyDeployed || isAddonsCreating;
                          const isRequired = isYieldRequiredForBond;
                          const isChecked =
                            field.state.value.includes(addon) ||
                            isDisabled ||
                            isRequired;

                          const handleToggle = (checked: boolean) => {
                            if (isDisabled || isRequired) {
                              return;
                            }

                            if (checked) {
                              field.handleChange([...field.state.value, addon]);
                            } else {
                              field.handleChange(
                                field.state.value.filter(
                                  (value: string) => value !== addon
                                )
                              );
                            }
                          };

                          return (
                            <AddonTypeCard
                              key={addon}
                              addonType={addon}
                              icon={Icon}
                              isChecked={isChecked}
                              isDisabled={isDisabled}
                              isRequired={isRequired}
                              disabledLabel={
                                isRequired
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
        </form>
      </div>

      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={handleVerificationSubmit}
        title={t("system-addons.addon-selection.confirm-deployment-title")}
        description={t(
          "system-addons.addon-selection.confirm-deployment-description"
        )}
        errorMessage={verificationError}
      />
    </OnboardingStepLayout>
  );
}
