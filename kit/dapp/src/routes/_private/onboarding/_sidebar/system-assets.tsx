import { OnboardingStep } from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import {
  type AssetType,
  getAssetTypeFromFactoryTypeId,
  type AssetFactoryTypeId,
} from "@/lib/zod/validators/asset-types";
import { orpc } from "@/orpc/orpc-client";
import { TokenTypeEnum } from "@/orpc/routes/token/routes/factory/factory.create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Building,
  Coins,
  Package,
  PiggyBank,
  Wallet,
} from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { type Control, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { createLogger } from "@settlemint/sdk-utils/logging";

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

const assetIcons = {
  bond: Building,
  equity: BarChart3,
  fund: PiggyBank,
  stablecoin: Coins,
  deposit: Wallet,
} as const;

const CheckboxWrapper = memo(
  ({
    onClick,
    children,
  }: {
    onClick: (e: React.MouseEvent) => void;
    children: React.ReactNode;
  }) => <div onClick={onClick}>{children}</div>
);
CheckboxWrapper.displayName = "CheckboxWrapper";

const AssetTypeFieldInner = memo(
  ({
    assetType,
    field,
    t,
    Icon,
    handleCheckboxClick,
    isDisabled,
  }: {
    assetType: AssetType;
    field: { value: string[]; onChange: (value: string[]) => void };
    t: ReturnType<typeof useTranslation>["t"];
    Icon: React.ElementType;
    handleCheckboxClick: (e: React.MouseEvent) => void;
    isDisabled: boolean;
  }) => {
    const isChecked = field.value.includes(assetType) || isDisabled;

    const handleItemClick = useCallback(() => {
      if (isDisabled) return;

      const newChecked = !field.value.includes(assetType);
      if (newChecked) {
        field.onChange([...field.value, assetType]);
      } else {
        field.onChange(
          field.value.filter((value: string) => value !== assetType)
        );
      }
    }, [field, assetType, isDisabled]);

    const handleCheckboxChange = useCallback(
      (checked: boolean) => {
        if (isDisabled) return;

        if (checked) {
          field.onChange([...field.value, assetType]);
        } else {
          field.onChange(
            field.value.filter((value: string) => value !== assetType)
          );
        }
      },
      [field, assetType, isDisabled]
    );

    return (
      <FormItem
        key={assetType}
        className={`flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 transition-colors ${
          isDisabled
            ? "opacity-50 cursor-not-allowed bg-muted/50"
            : "hover:bg-accent/50 cursor-pointer"
        }`}
        onClick={handleItemClick}
      >
        <FormControl>
          <CheckboxWrapper onClick={handleCheckboxClick}>
            <Checkbox
              checked={isChecked}
              onCheckedChange={handleCheckboxChange}
              disabled={isDisabled}
            />
          </CheckboxWrapper>
        </FormControl>
        <div className="flex-1 space-y-1 leading-none">
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 ${isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"}`}
            />
            <FormLabel
              className={`text-sm font-medium ${isDisabled ? "" : "cursor-pointer"}`}
            >
              {(
                t as (key: string, options?: Record<string, unknown>) => string
              )(`asset-types.${assetType}`, { ns: "tokens" })}
            </FormLabel>
            {isDisabled && (
              <span className="text-xs text-muted-foreground">(Deployed)</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {(t as (key: string) => string)(`assets.descriptions.${assetType}`)}
          </p>
        </div>
      </FormItem>
    );
  }
);
AssetTypeFieldInner.displayName = "AssetTypeFieldInner";

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
    const { t } = useTranslation(["onboarding", "general", "tokens"]);
    const iconKey = assetType;
    const Icon = iconKey in assetIcons ? assetIcons[iconKey] : Package;

    const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
    }, []);

    const renderField = useCallback(
      ({
        field,
      }: {
        field: { value: string[]; onChange: (value: string[]) => void };
      }) => (
        <AssetTypeFieldInner
          assetType={assetType}
          field={field}
          t={t}
          Icon={Icon}
          handleCheckboxClick={handleCheckboxClick}
          isDisabled={isDisabled}
        />
      ),
      [assetType, t, Icon, handleCheckboxClick, isDisabled]
    );

    return (
      <FormField
        key={assetType}
        control={control}
        name="assets"
        render={renderField}
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

    createFactories({
      verification: {
        verificationCode: "111111",
        verificationType: "pincode",
      },
      contract: systemDetails.tokenFactoryRegistry,
      factories,
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
        someFactoriesFailed: t("assets.factory-messages.some-factories-failed"),
        allFactoriesFailed: t("assets.factory-messages.all-factories-failed"),
        factoryAlreadyExists: t(
          "assets.factory-messages.factory-already-exists"
        ),
        allFactoriesSkipped: t("assets.factory-messages.all-factories-skipped"),
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
  }, [
    systemAddress,
    systemDetails?.tokenFactoryRegistry,
    t,
    form,
    createFactories,
  ]);

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
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {hasDeployedAssets
            ? t("assets.asset-types-deployed")
            : t("assets.select-asset-types")}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {hasDeployedAssets
            ? t("assets.your-asset-factories-ready")
            : t("assets.choose-asset-types")}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl space-y-6">
          {hasDeployedAssets ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg
                    className="h-5 w-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium text-green-800 dark:text-green-300">
                    {t("assets.asset-factories-deployed-successfully")}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    {t("assets.deployed-factories")}
                  </p>
                  <div className="grid gap-2">
                    {systemDetails?.tokenFactories.map((factory) => {
                      const iconKey = factory.typeId as keyof typeof assetIcons;
                      const Icon =
                        iconKey in assetIcons ? assetIcons[iconKey] : Package;
                      return (
                        <div
                          key={factory.id}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{factory.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                      {t("assets.what-are-asset-factories")}
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {t("assets.asset-factories-description")}
                    </p>
                  </div>
                </div>
              </div>

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
    </div>
  );
}
