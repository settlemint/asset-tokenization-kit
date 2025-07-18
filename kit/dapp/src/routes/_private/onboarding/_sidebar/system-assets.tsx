import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { VerificationDialog } from "@/components/ui/verification-dialog";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import {
  type AssetFactoryTypeId,
  type AssetType,
  getAssetTypeFromFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import {
  TokenTypeEnum,
  type TokenType,
} from "@/orpc/routes/token/routes/factory/factory.create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { memo, useCallback, useMemo, useState } from "react";
import { type Control, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { AssetTypeCard } from "@/components/onboarding/assets/asset-type-card";
import { AssetDeploymentSuccess } from "@/components/onboarding/assets/asset-deployment-success";
import { getAssetIcon } from "@/components/onboarding/assets/asset-icons";
import { InfoAlert } from "@/components/ui/info-alert";
import { SectionHeader } from "@/components/onboarding/section-header";

const logger = createLogger();

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-assets"
)({
  validateSearch: zodValidator(createOnboardingSearchSchema()),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.systemAssets),
  component: RouteComponent,
});

const assetSelectionSchema = z.object({
  assets: z.array(TokenTypeEnum).min(1, "Select at least one asset type"),
});

type AssetSelectionFormValues = z.infer<typeof assetSelectionSchema>;

// Asset icons and components are now imported from separate files

const AssetTypeFormField = memo(
  ({
    assetType,
    control,
    isDisabled,
  }: {
    assetType: AssetType;
    control: Control<AssetSelectionFormValues>;
    isDisabled: boolean;
  }) => {
    const Icon = getAssetIcon(assetType);

    return (
      <FormField
        key={assetType}
        control={control}
        name="assets"
        render={({ field }) => {
          const isChecked = field.value.includes(assetType) || isDisabled;

          const handleToggle = (checked: boolean) => {
            if (isDisabled) return;

            if (checked) {
              field.onChange([...field.value, assetType]);
            } else {
              field.onChange(
                field.value.filter((value: string) => value !== assetType)
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
        }}
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

  // For factory deployment, we'll use PIN code verification by default
  const hasTwoFactor = false;
  const hasPincode = true;

  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: !!systemAddress,
  });

  const form = useForm<AssetSelectionFormValues>({
    resolver: zodResolver(assetSelectionSchema),
    defaultValues: {
      assets: [],
    },
  });

  const { mutate: createFactories, isPending } = useStreamingMutation({
    mutationOptions: orpc.token.factoryCreate.mutationOptions(),
    onSuccess: async () => {
      toast.success(t("assets.deployed"));

      // Refetch system data to get updated factory list
      await queryClient.invalidateQueries({
        queryKey: orpc.system.read.key(),
      });
      await queryClient.invalidateQueries({
        queryKey: orpc.system.read.queryOptions({
          input: { id: systemAddress ?? "" },
        }).queryKey,
        refetchType: "all",
      });

      // Refetch user data to update onboarding state
      await queryClient.refetchQueries({
        queryKey: orpc.user.me.key(),
      });

      // Navigate to next step
      await completeStepAndNavigate(OnboardingStep.systemAssets);
    },
  });

  const handleDeployFactories = useCallback(() => {
    if (!systemAddress || !systemDetails?.tokenFactoryRegistry) {
      toast.error(t("assets.no-system"));
      return;
    }

    const values = form.getValues();
    if (values.assets.length === 0) {
      void form.trigger("assets");
      return;
    }

    const factories = values.assets.map((assetType) => ({
      type: assetType,
      name: (t as (key: string, options?: Record<string, unknown>) => string)(
        `asset-types.${assetType}`,
        { ns: "tokens" }
      ),
    }));

    // Store the factories and show the verification dialog
    setPendingFactories(factories);
    setVerificationError(null);
    setShowVerificationModal(true);
  }, [systemAddress, systemDetails?.tokenFactoryRegistry, t, form]);

  // Handle PIN code submission
  const handlePincodeSubmit = useCallback(
    (pincode: string) => {
      if (!pendingFactories || !systemDetails?.tokenFactoryRegistry) {
        return;
      }

      setVerificationError(null);
      setShowVerificationModal(false);

      createFactories({
        verification: {
          verificationCode: pincode,
          verificationType: "pincode",
        },
        contract: systemDetails.tokenFactoryRegistry,
        factories: pendingFactories,
        messages: {
          initialLoading: t("assets.factory-messages.initial-loading"),
          factoryCreated: t("assets.factory-messages.factory-created"),
          creatingFactory: t("assets.factory-messages.creating-factory"),
          factoryCreationFailed: t(
            "assets.factory-messages.factory-creation-failed"
          ),
          batchProgress: t("assets.factory-messages.batch-progress"),
          batchCompleted: t("assets.factory-messages.batch-completed"),
          noResultError: t("assets.factory-messages.no-result-error"),
          defaultError: t("assets.factory-messages.default-error"),
          systemNotBootstrapped: t(
            "assets.factory-messages.system-not-bootstrapped"
          ),
          transactionSubmitted: t(
            "assets.factory-messages.transaction-submitted"
          ),
          factoryCreationCompleted: t(
            "assets.factory-messages.factory-creation-completed"
          ),
          allFactoriesSucceeded: t(
            "assets.factory-messages.all-factories-succeeded"
          ),
          someFactoriesFailed: t(
            "assets.factory-messages.some-factories-failed"
          ),
          allFactoriesFailed: t("assets.factory-messages.all-factories-failed"),
          factoryAlreadyExists: t(
            "assets.factory-messages.factory-already-exists"
          ),
          allFactoriesSkipped: t(
            "assets.factory-messages.all-factories-skipped"
          ),
          someFactoriesSkipped: t(
            "assets.factory-messages.some-factories-skipped"
          ),
          waitingForMining: t("assets.factory-messages.waiting-for-mining"),
          transactionFailed: t("assets.factory-messages.transaction-failed"),
          transactionDropped: t("assets.factory-messages.transaction-dropped"),
          waitingForIndexing: t("assets.factory-messages.waiting-for-indexing"),
          transactionIndexed: t("assets.factory-messages.transaction-indexed"),
          streamTimeout: t("assets.factory-messages.stream-timeout"),
          indexingTimeout: t("assets.factory-messages.indexing-timeout"),
        },
      });
    },
    [pendingFactories, systemDetails?.tokenFactoryRegistry, createFactories, t]
  );

  // Handle OTP submission
  const handleOtpSubmit = useCallback(
    (otp: string) => {
      if (!pendingFactories || !systemDetails?.tokenFactoryRegistry) {
        return;
      }

      setVerificationError(null);
      setShowVerificationModal(false);

      createFactories({
        verification: {
          verificationCode: otp,
          verificationType: "two-factor",
        },
        contract: systemDetails.tokenFactoryRegistry,
        factories: pendingFactories,
        messages: {
          initialLoading: t("assets.factory-messages.initial-loading"),
          factoryCreated: t("assets.factory-messages.factory-created"),
          creatingFactory: t("assets.factory-messages.creating-factory"),
          factoryCreationFailed: t(
            "assets.factory-messages.factory-creation-failed"
          ),
          batchProgress: t("assets.factory-messages.batch-progress"),
          batchCompleted: t("assets.factory-messages.batch-completed"),
          noResultError: t("assets.factory-messages.no-result-error"),
          defaultError: t("assets.factory-messages.default-error"),
          systemNotBootstrapped: t(
            "assets.factory-messages.system-not-bootstrapped"
          ),
          transactionSubmitted: t(
            "assets.factory-messages.transaction-submitted"
          ),
          factoryCreationCompleted: t(
            "assets.factory-messages.factory-creation-completed"
          ),
          allFactoriesSucceeded: t(
            "assets.factory-messages.all-factories-succeeded"
          ),
          someFactoriesFailed: t(
            "assets.factory-messages.some-factories-failed"
          ),
          allFactoriesFailed: t("assets.factory-messages.all-factories-failed"),
          factoryAlreadyExists: t(
            "assets.factory-messages.factory-already-exists"
          ),
          allFactoriesSkipped: t(
            "assets.factory-messages.all-factories-skipped"
          ),
          someFactoriesSkipped: t(
            "assets.factory-messages.some-factories-skipped"
          ),
          waitingForMining: t("assets.factory-messages.waiting-for-mining"),
          transactionFailed: t("assets.factory-messages.transaction-failed"),
          transactionDropped: t("assets.factory-messages.transaction-dropped"),
          waitingForIndexing: t("assets.factory-messages.waiting-for-indexing"),
          transactionIndexed: t("assets.factory-messages.transaction-indexed"),
          streamTimeout: t("assets.factory-messages.stream-timeout"),
          indexingTimeout: t("assets.factory-messages.indexing-timeout"),
        },
      });
    },
    [pendingFactories, systemDetails?.tokenFactoryRegistry, createFactories, t]
  );

  const availableAssets = TokenTypeEnum.options;
  const hasDeployedAssets = (systemDetails?.tokenFactories.length ?? 0) > 0;

  // Create a set of already deployed asset types for easy lookup
  const deployedAssetTypes = useMemo(
    () =>
      new Set(
        systemDetails?.tokenFactories.map((factory) => {
          return getAssetTypeFromFactoryTypeId(
            factory.typeId as AssetFactoryTypeId
          );
        }) ?? []
      ),
    [systemDetails?.tokenFactories]
  );

  const onNext = async () => {
    if (hasDeployedAssets) {
      try {
        // Refresh user state to ensure onboarding state is up to date
        await queryClient.refetchQueries({
          queryKey: orpc.user.me.key(),
        });

        // Use completeStepAndNavigate to properly update state and navigate
        await completeStepAndNavigate(OnboardingStep.systemAssets);
      } catch (error) {
        logger.error("Navigation error:", error);
        toast.error("Failed to navigate to next step");
      }
      return;
    }
    handleDeployFactories();
  };

  const onPrevious = async () => {
    await navigateToStep(OnboardingStep.systemSettings);
  };

  const renderAssetTypeField = useCallback(
    () => (
      <FormItem>
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
                control={form.control}
                isDisabled={deployedAssetTypes.has(assetType)}
              />
            ))}
          </div>
        </div>
      </FormItem>
    ),
    [availableAssets, form.control, t, deployedAssetTypes]
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
                factories={systemDetails?.tokenFactories || []}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <InfoAlert
                title={t("assets.what-are-asset-factories")}
                description={t("assets.asset-factories-description")}
              />

              <Form {...form}>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="assets"
                    render={renderAssetTypeField}
                  />

                  {form.formState.errors.assets && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {form.formState.errors.assets.message}
                    </p>
                  )}
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-between">
          {!hasDeployedAssets && (
            <Button type="button" variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={isPending}
            className={hasDeployedAssets ? "ml-auto" : ""}
          >
            {hasDeployedAssets ? "Continue" : "Deploy Assets"}
          </Button>
        </div>
      </div>

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
