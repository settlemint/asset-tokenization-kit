import { AssetDeploymentSuccess } from "@/components/onboarding/assets/asset-deployment-success";
import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { AssetTypeCard } from "@/components/onboarding/assets/asset-type-card";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { SectionHeader } from "@/components/onboarding/section-header";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { InfoAlert } from "@/components/ui/info-alert";
import { VerificationDialog } from "@/components/ui/verification-dialog";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { authClient } from "@/lib/auth/auth.client";
import {
  type AssetFactoryTypeId,
  type AssetType,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import {
  type TokenType,
  TokenTypeEnum,
} from "@/orpc/routes/token/routes/factory/factory.create.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { memo, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const logger = createLogger();

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-assets"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemAssets),
  loader: async ({ context: { queryClient, orpc } }) => {
    // Get system address from settings
    const systemAddress = await queryClient.ensureQueryData(
      orpc.settings.read.queryOptions({
        input: { key: "SYSTEM_ADDRESS" },
      })
    );

    // Prefetch system details if address is available
    if (systemAddress) {
      await queryClient.prefetchQuery(
        orpc.system.read.queryOptions({
          input: { id: systemAddress },
        })
      );
    }
  },
  component: RouteComponent,
});

interface AssetSelectionFormValues {
  assets: TokenType[];
}

// Asset icons and components are now imported from separate files

const AssetTypeFormField = memo(
  ({
    assetType,
    field,
    isDisabled,
  }: {
    assetType: AssetType;
    field: {
      state: {
        value: TokenType[];
      };
      handleChange: (value: TokenType[]) => void;
    };
    isDisabled: boolean;
  }) => {
    const Icon = getAssetIcon(assetType);
    const isChecked = field.state.value.includes(assetType) || isDisabled;

    const handleToggle = (checked: boolean) => {
      if (isDisabled) return;

      if (checked) {
        field.handleChange([...field.state.value, assetType]);
      } else {
        field.handleChange(
          field.state.value.filter((value: string) => value !== assetType)
        );
      }
    };

    return (
      <AssetTypeCard
        assetType={assetType}
        icon={Icon}
        isChecked={isChecked}
        isDisabled={isDisabled}
        onToggle={handleToggle}
      />
    );
  }
);

AssetTypeFormField.displayName = "AssetTypeFormField";

function RouteComponent() {
  const { navigateToStep, completeStepAndNavigate } = useOnboardingNavigation();
  const { t } = useTranslation(["onboarding", "general", "tokens"]);
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");
  const queryClient = useQueryClient();

  // Get user authentication state
  const { data: session } = authClient.useSession();
  const user = session?.user;

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

  // Use actual authentication state from user
  const hasTwoFactor = Boolean(user?.twoFactorEnabled);
  const hasPincode = Boolean(user?.pincodeEnabled);

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

  const { mutate: createFactories, isPending } = useStreamingMutation({
    mutationOptions: orpc.token.factoryCreate.mutationOptions(),
    onSuccess: async () => {
      toast.success(t("assets.deployed"));

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
    },
  });

  // Handle verification code submission
  const handleVerificationSubmit = useCallback(
    (verificationCode: string, verificationType: "pincode" | "two-factor") => {
      if (!pendingFactories || !systemDetails?.tokenFactoryRegistry) {
        return;
      }

      setVerificationError(null);
      setShowVerificationModal(false);

      createFactories({
        verification: {
          verificationCode,
          verificationType,
        },
        contract: systemDetails.tokenFactoryRegistry,
        factories: pendingFactories,
      });
    },
    [pendingFactories, systemDetails?.tokenFactoryRegistry, createFactories]
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
  const hasDeployedAssets = (systemDetails?.tokenFactories.length ?? 0) > 0;

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

  // Stable reference for deployed factories
  const deployedFactories = systemDetails?.tokenFactories ?? [];

  const onNext = useCallback(async () => {
    try {
      await queryClient.refetchQueries({ queryKey: orpc.user.me.key() });
      await completeStepAndNavigate(OnboardingStep.systemAssets);
    } catch (error) {
      logger.error("Navigation error:", error);
      toast.error("Failed to navigate to next step");
    }
  }, [queryClient, completeStepAndNavigate]);

  const onPrevious = useCallback(
    async () => navigateToStep(OnboardingStep.systemSettings),
    [navigateToStep]
  );

  return (
    <div className="h-full flex flex-col">
      <SectionHeader
        title={
          hasDeployedAssets
            ? t("assets.asset-types-deployed")
            : t("assets.select-asset-types")
        }
        description={
          hasDeployedAssets
            ? t("assets.your-asset-factories-ready")
            : t("assets.choose-asset-types")
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          {hasDeployedAssets ? (
            <div className="space-y-4">
              <AssetDeploymentSuccess
                title={t("assets.asset-factories-deployed-successfully")}
                deployedFactoriesLabel={t("assets.deployed-factories")}
                factories={deployedFactories}
              />
            </div>
          ) : (
            <div className="space-y-4">
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
                              {availableAssets.map((assetType) => (
                                <AssetTypeFormField
                                  key={assetType}
                                  assetType={assetType}
                                  field={{
                                    state: {
                                      value: field.state.value,
                                    },
                                    handleChange: field.handleChange,
                                  }}
                                  isDisabled={deployedAssetTypes.has(assetType)}
                                />
                              ))}
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onPrevious}
                    >
                      Previous
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      Deploy Assets
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {hasDeployedAssets && (
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-end">
            <Button type="button" onClick={onNext} disabled={isPending}>
              Continue
            </Button>
          </div>
        </div>
      )}

      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        hasTwoFactor={hasTwoFactor}
        hasPincode={hasPincode}
        onPincodeSubmit={handlePincodeSubmit}
        onOtpSubmit={handleOtpSubmit}
        isLoading={isPending}
        title="Confirm Asset Deployment"
        description="Please verify your identity to deploy the asset factories."
        errorMessage={verificationError}
      />
    </div>
  );
}
