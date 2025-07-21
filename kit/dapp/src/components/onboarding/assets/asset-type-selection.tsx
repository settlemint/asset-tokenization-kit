import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { AssetTypeCard } from "@/components/onboarding/assets/asset-type-card";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { useSettings } from "@/hooks/use-settings";
import {
  type AssetFactoryTypeId,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import {
  type TokenType,
  TokenTypeEnum,
} from "@/orpc/routes/token/routes/factory/factory.create.schema";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface AssetSelectionFormValues {
  assets: TokenType[];
}

export function AssetTypeSelection() {
  const { navigateToStep, refreshUserState, completeStepAndNavigate } =
    useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "general", "tokens"]);
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");
  const queryClient = useQueryClient();

  // Verification dialog state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [pendingFactories, setPendingFactories] = useState<
    | {
        type: TokenType;
        name: string;
      }[]
    | null
  >(null);

  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: !!systemAddress,
  });

  const form = useForm({
    defaultValues: {
      assets: [] as TokenType[],
    },
    onSubmit: ({ value }: { value: AssetSelectionFormValues }) => {
      if (!systemAddress || !systemDetails?.tokenFactoryRegistry) {
        toast.error(t("assets.no-system"));
        return;
      }

      const factories = value.assets.map((assetType) => ({
        type: assetType,
        name: t(`asset-types.${assetType}`, { ns: "tokens" }),
      }));

      // Store the factories and show the verification dialog
      setPendingFactories(factories);
      setVerificationError(null);
      setShowVerificationModal(true);
    },
  });

  const { mutateAsync: createFactories, isPending: isFactoriesCreating } =
    useMutation(
      orpc.token.factoryCreate.mutationOptions({
        onSuccess: async () => {
          // Refetch all relevant data
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: orpc.system.read.key() }),
            queryClient.invalidateQueries({
              queryKey: orpc.system.read.queryOptions({
                input: { id: systemAddress ?? "" },
              }).queryKey,
              refetchType: "all",
            }),
            queryClient.refetchQueries({ queryKey: orpc.user.me.key() }),
          ]);
          // Refresh user state to update onboarding state
          await refreshUserState();
          await completeStepAndNavigate(OnboardingStep.systemAssets);
        },
      })
    );

  // Handle verification code submission
  const handleVerificationSubmit = useCallback(
    (verificationCode: string, verificationType: "pincode" | "two-factor") => {
      if (!pendingFactories || !systemDetails?.tokenFactoryRegistry) {
        return;
      }

      setVerificationError(null);
      setShowVerificationModal(false);

      toast.promise(
        createFactories({
          verification: {
            verificationCode,
            verificationType,
          },
          contract: systemDetails.tokenFactoryRegistry,
          factories: pendingFactories,
        }),
        {
          loading: "Deploying asset factories...",
          success: t("assets.deployed"),
          error: (error: Error) =>
            `Failed to deploy asset factories: ${error.message}`,
        }
      );
    },
    [pendingFactories, systemDetails?.tokenFactoryRegistry, createFactories, t]
  );

  // Handle PIN code submission
  const handlePincodeSubmit = useCallback(
    (pincode: string) => {
      handleVerificationSubmit(pincode, "pincode");
    },
    [handleVerificationSubmit]
  );

  // Handle OTP submission
  const handleOtpSubmit = useCallback(
    (otp: string) => {
      handleVerificationSubmit(otp, "two-factor");
    },
    [handleVerificationSubmit]
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

  const onPrevious = useCallback(
    async () => navigateToStep(OnboardingStep.systemSettings),
    [navigateToStep]
  );

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            {t("assets.select-asset-types")}
          </h2>
          <p className="text-sm text-muted-foreground pt-2">
            {t("assets.choose-asset-types")}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl space-y-6">
            <InfoAlert
              title={t("assets.what-are-asset-factories")}
              description={t("assets.asset-factories-description")}
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
                    name="assets"
                    validators={{
                      onChange: ({ value }) => {
                        if (value.length === 0) {
                          return "Select at least one asset type";
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
                              {t("assets.available-asset-types")}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t("assets.select-all-asset-types")}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {availableAssets.map((assetType) => {
                              const Icon = getAssetIcon(assetType);
                              const isDisabled =
                                deployedAssetTypes.has(assetType);
                              const isChecked =
                                field.state.value.includes(assetType) ||
                                isDisabled;

                              const handleToggle = (checked: boolean) => {
                                if (isDisabled) {
                                  return;
                                }

                                if (checked) {
                                  field.handleChange([
                                    ...field.state.value,
                                    assetType,
                                  ]);
                                } else {
                                  field.handleChange(
                                    field.state.value.filter(
                                      (value: string) => value !== assetType
                                    )
                                  );
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

              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={onPrevious}>
                    Previous
                  </Button>
                  <Button type="submit" disabled={isFactoriesCreating}>
                    Deploy Assets
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onSubmit={({ pincode, otp }) => {
          if (pincode) {
            handlePincodeSubmit(pincode);
          } else if (otp) {
            handleOtpSubmit(otp);
          }
        }}
        title="Confirm Asset Deployment"
        description="Please verify your identity to deploy the asset factories."
        errorMessage={verificationError}
      />
    </>
  );
}
