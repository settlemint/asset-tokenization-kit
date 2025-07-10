import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import { RecoveryCodesStep } from "@/components/onboarding/steps/recovery-codes-step";
import { SystemBootstrapStep } from "@/components/onboarding/steps/system-bootstrap-step";
import { WalletDisplayStep } from "@/components/onboarding/steps/wallet-display-step";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";

import { useMemo, useState, useCallback } from "react";
import { z } from "zod/v4";
import { useSettings } from "@/hooks/use-settings";
import { orpc, client } from "@/orpc";
import { toast } from "sonner";
import {
  fiatCurrency,
  fiatCurrencyMetadata,
} from "@/lib/zod/validators/fiat-currency";
import { useWizardContext } from "@/components/multistep-form/wizard-context";
import { VerificationDialog } from "@/components/ui/verification-dialog";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { formatValidationError } from "@/lib/utils/format-validation-error";
import { authClient } from "@/lib/auth/auth.client";

// Define the onboarding form schema
const onboardingSchema = z.object({
  walletGenerated: z.boolean().default(false),
  walletAddress: z.string().optional(),
  walletSecured: z.boolean().default(false),
  systemBootstrapped: z.boolean().default(false),
  systemAddress: z.string().optional(),
  baseCurrency: fiatCurrency().default("USD"),
  selectedAssetTypes: z
    .array(z.enum(["equity", "bond", "deposit", "fund", "stablecoin"]))
    .default([]),
  assetFactoriesDeployed: z.boolean().default(false),
  selectedAddons: z
    .array(z.enum(["airdrops", "xvp", "yield", "governance", "analytics"]))
    .default([]),
  addonsConfigured: z.boolean().default(false),
  kycCompleted: z.boolean().default(false),
  identityRegistered: z.boolean().default(false),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  residenceCountry: z.string().optional(),
  investorType: z.enum(["retail", "professional", "institutional"]).optional(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface UseOnboardingStepsParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  systemAddress: string | null;
  systemDetails: { tokenFactories: unknown[] } | null;
  shouldShowWalletSteps: boolean;
  shouldShowSystemSetupSteps: boolean;
  shouldShowIdentitySteps: boolean;
}

export function useOnboardingSteps({
  user,
  systemAddress,
  systemDetails,
  shouldShowWalletSteps,
  shouldShowSystemSetupSteps,
  shouldShowIdentitySteps,
}: UseOnboardingStepsParams) {
  // Get current base currency from settings
  const [currentBaseCurrency] = useSettings("BASE_CURRENCY");
  const groups: StepGroup[] = useMemo(() => {
    const dynamicGroups: StepGroup[] = [];

    if (shouldShowWalletSteps) {
      dynamicGroups.push({
        id: "wallet",
        title: "Wallet Setup",
        description: "Create and secure your wallet",
        collapsible: true,
        defaultExpanded: true,
      });
    }

    if (shouldShowSystemSetupSteps) {
      dynamicGroups.push({
        id: "system",
        title: "System Setup",
        description: "Initialize blockchain and configure assets",
        collapsible: true,
        defaultExpanded: !shouldShowWalletSteps,
      });
    }

    if (shouldShowIdentitySteps) {
      dynamicGroups.push({
        id: "identity",
        title: "Identity Setup",
        description: "Complete KYC and register identity",
        collapsible: true,
        defaultExpanded: dynamicGroups.length === 0,
      });
    }

    return dynamicGroups;
  }, [
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
  ]);

  const steps: StepDefinition<OnboardingFormData>[] = useMemo(() => {
    const dynamicSteps: StepDefinition<OnboardingFormData>[] = [];

    if (shouldShowWalletSteps) {
      dynamicSteps.push(
        {
          id: "wallet-creation",
          title: "Create Your Wallet",
          description: "Generate a secure wallet for all blockchain operations",
          groupId: "wallet",
          fields: [],
          onStepComplete: async () => Promise.resolve(),
          component: ({
            form,
            stepId,
            onNext,
            onPrevious,
            isFirstStep,
            isLastStep,
          }) => (
            <WalletDisplayStep
              form={form}
              stepId={stepId}
              onNext={onNext}
              onPrevious={onPrevious}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              user={user}
            />
          ),
        },
        {
          id: "wallet-security",
          title: "Secure Your Wallet",
          description: "Set up security verification for all operations",
          groupId: "wallet",
          fields: [],
          onStepComplete: async () => Promise.resolve(),
          component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => {
            // In the onboarding flow, always show the selection screen first
            // This allows users to review and modify their security settings
            // They can click Continue if they're happy with existing security
            const forceShowSelection = true;

            return (
              <WalletSecurityStep
                onNext={onNext}
                onPrevious={onPrevious}
                isFirstStep={isFirstStep}
                isLastStep={isLastStep}
                user={user}
                forceShowSelection={forceShowSelection}
              />
            );
          },
        },
        {
          id: "recovery-codes",
          title: "Recovery Codes",
          description: "Save your wallet recovery codes",
          groupId: "wallet",
          fields: [],
          onStepComplete: async () => Promise.resolve(),
          component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => (
            <RecoveryCodesStep
              onNext={onNext}
              onPrevious={onPrevious}
              isFirstStep={isFirstStep}
              isLastStep={isLastStep}
              user={user}
            />
          ),
        }
      );
    }

    if (shouldShowSystemSetupSteps) {
      // 1. Deploy core system
      dynamicSteps.push({
        id: "system-bootstrap",
        title: "Deploy core system",
        description: "Initialize the blockchain system and set base currency",
        groupId: "system",
        fields: [],
        onStepComplete: async () => Promise.resolve(),
        component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => (
          <SystemBootstrapStep
            onNext={onNext}
            onPrevious={onPrevious}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            user={user}
          />
        ),
      });

      // 2. Configure platform settings
      dynamicSteps.push({
        id: "configure-platform-settings",
        title: "Configure platform settings",
        description: "Define how your platform behaves by default",
        groupId: "system",
        fields: [
          {
            name: "baseCurrency",
            label: "Base Currency",
            type: "select",
            description: "Choose the default currency for your platform",
            options: Object.entries(fiatCurrencyMetadata).map(
              ([code, metadata]) => ({
                label: `${metadata.name} (${code})`,
                value: code,
              })
            ),
          },
        ],
        component: ({
          form,
          stepId,
          onNext,
          onPrevious,
          isFirstStep,
          isLastStep,
        }) => {
          // Get the settings hook inside the component
          const [, setBaseCurrency] = useSettings("BASE_CURRENCY");
          // Get wizard context to manage step state
          const { clearStepError, markStepComplete } = useWizardContext();

          const handleConfirm = async () => {
            try {
              // Clear any existing errors for this step
              clearStepError("configure-platform-settings");

              const formValues = form.state.values;
              if (formValues.baseCurrency) {
                setBaseCurrency(formValues.baseCurrency);

                // Mark step as complete
                markStepComplete("configure-platform-settings");

                toast.success("Platform settings saved successfully");
              }
              onNext?.();
            } catch (error) {
              toast.error("Failed to save platform settings");
              console.error("Error saving base currency:", error);
            }
          };

          return (
            <div className="max-w-2xl space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Configure Platform Settings
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Define how your platform behaves by default
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm">
                  Before you begin issuing assets, let's configure some basic
                  settings that determine how the platform behaves. These
                  default values help personalize the experience for you and
                  your users.
                </p>
                <p className="text-sm">
                  You can update these preferences later in the platform
                  settings.
                </p>
              </div>

              {/* Base Currency Field */}
              <form.Field name="baseCurrency">
                {(field) => (
                  <div className="space-y-2">
                    <label
                      htmlFor="baseCurrency"
                      className="text-sm font-medium"
                    >
                      Base Currency
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Choose the default currency for your platform
                    </p>
                    <div className="relative">
                      <select
                        id="baseCurrency"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 border border-input rounded-md bg-background text-sm appearance-none"
                      >
                        <option value="">Select a currency</option>
                        {Object.entries(fiatCurrencyMetadata).map(
                          ([code, metadata]) => (
                            <option key={code} value={code}>
                              {metadata.name} ({code})
                            </option>
                          )
                        )}
                      </select>
                      <svg
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                  </div>
                )}
              </form.Field>

              {/* Navigation Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={onPrevious}
                    className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                  >
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Confirm
                </button>
              </div>
            </div>
          );
        },
      });

      // 3. Select supported assets
      dynamicSteps.push({
        id: "asset-selection",
        title: "Select supported assets",
        description: "Choose which asset types your platform will support",
        groupId: "system",
        fields: [
          {
            name: "selectedAssetTypes",
            label: "Asset Types",
            type: "checkbox",
            description:
              "Which assets do you want to support? At least one is required.",
            options: [
              { label: "Equity Tokens", value: "equity" },
              { label: "Bond Tokens", value: "bond" },
              { label: "Deposit Tokens", value: "deposit" },
              { label: "Fund Tokens", value: "fund" },
              { label: "Stablecoins", value: "stablecoin" },
            ],
          },
        ],
        validate: (data) =>
          !data.selectedAssetTypes?.length
            ? "At least one asset type must be selected"
            : undefined,
        component: ({
          form,
          stepId,
          onNext,
          onPrevious,
          isFirstStep,
          isLastStep,
        }) => {
          const { clearStepError, markStepComplete } = useWizardContext();
          const [currentScreen, setCurrentScreen] = useState<
            "form" | "progress" | "success"
          >("form");

          // PIN/OTP Modal state
          const [showVerificationModal, setShowVerificationModal] =
            useState(false);
          const [verificationError, setVerificationError] = useState<
            string | null
          >(null);

          // Track deployment progress for selected factories
          const [deploymentProgress, setDeploymentProgress] = useState<
            Array<{
              type: string;
              name: string;
              completed: boolean;
              inProgress: boolean;
            }>
          >([]);

          // Get user session for security capability detection
          const { data: session } = authClient.useSession();
          const currentUser = user ?? session?.user;
          const hasTwoFactor = currentUser?.twoFactorEnabled || false;
          const hasPincode = currentUser?.pincodeEnabled || false;

          // Factory creation state
          const [isCreatingFactories, setIsCreatingFactories] = useState(false);
          const [isTrackingFactories, setIsTrackingFactories] = useState(false);
          const [latestMessage, setLatestMessage] = useState<string | null>(
            null
          );

          // Direct factory creation function without useStreamingMutation
          const createFactories = useCallback(
            async (params: any) => {
              setIsCreatingFactories(true);
              setIsTrackingFactories(true);

              try {
                console.log("Starting factory creation with params:", params);

                // Call the ORPC client directly
                const factoryIterator =
                  await client.token.factoryCreate(params);

                console.log("Factory iterator created:", factoryIterator);

                let finalResults: any[] = [];

                // Process the async iterator
                for await (const event of factoryIterator) {
                  console.log("Factory creation event:", event);
                  setLatestMessage(event.message || "Processing...");

                  if (event.status === "completed" && event.result) {
                    finalResults = event.result;
                  }

                  // Update progress based on current factory
                  if (event.currentFactory) {
                    const { type, name } = event.currentFactory;
                    setDeploymentProgress((prev) => {
                      const updated = [...prev];
                      const index = updated.findIndex((f) => f.type === type);

                      if (index >= 0) {
                        updated[index] = {
                          type,
                          name,
                          completed:
                            event.status === "confirmed" ||
                            event.status === "completed",
                          inProgress: event.status === "pending",
                        };
                      }

                      return updated;
                    });
                  }
                }

                // Success handling
                setShowVerificationModal(false);
                setVerificationError(null);
                markStepComplete("asset-selection");
                setCurrentScreen("success");

                // Update final progress based on results
                if (Array.isArray(finalResults)) {
                  setDeploymentProgress(
                    finalResults.map((result) => ({
                      type: result.type,
                      name: result.name,
                      completed: !result.error,
                      inProgress: false,
                    }))
                  );
                }
              } catch (error) {
                console.error("Factory creation failed:", error);
                const errorMessage = formatValidationError(error);
                setVerificationError(errorMessage);
                toast.error(errorMessage);
              } finally {
                setIsCreatingFactories(false);
                setIsTrackingFactories(false);
              }
            },
            [
              client.token.factoryCreate,
              setShowVerificationModal,
              setVerificationError,
              markStepComplete,
              setCurrentScreen,
              setDeploymentProgress,
            ]
          );

          const isDeploying = isCreatingFactories || isTrackingFactories;

          // Handle PIN/OTP verification
          const handlePincodeSubmit = (pincode: string) => {
            setVerificationError(null);

            // Check if system is bootstrapped
            if (!systemAddress) {
              setVerificationError(
                "System is not bootstrapped. Please complete the system setup first."
              );
              return;
            }

            const currentSelectedAssets =
              form.state.values.selectedAssetTypes || [];

            // Create factory objects from selected asset types
            const factories = currentSelectedAssets.map(
              (assetType: string) => ({
                type: assetType,
                name: `${assetType.charAt(0).toUpperCase() + assetType.slice(1)} Factory`,
              })
            );

            // Initialize deployment progress with first factory in progress
            setDeploymentProgress(
              factories.map((factory, index) => ({
                type: factory.type,
                name: factory.name,
                completed: false,
                inProgress: index === 0, // Start with first factory in progress
              }))
            );

            // Show progress screen and close modal
            setCurrentScreen("progress");
            setShowVerificationModal(false);
            clearStepError("asset-selection");

            try {
              createFactories({
                contract: systemAddress, // Use the actual system address
                factories,
                verification: {
                  verificationCode: pincode,
                  verificationType: "pincode",
                },
              });
            } catch (error) {
              console.error("Factory creation error:", error);
              setVerificationError(
                "Failed to start factory creation. Please try again."
              );
            }
          };

          const handleOtpSubmit = (otp: string) => {
            setVerificationError(null);

            // Check if system is bootstrapped
            if (!systemAddress) {
              setVerificationError(
                "System is not bootstrapped. Please complete the system setup first."
              );
              return;
            }

            const currentSelectedAssets =
              form.state.values.selectedAssetTypes || [];

            // Create factory objects from selected asset types
            const factories = currentSelectedAssets.map(
              (assetType: string) => ({
                type: assetType,
                name: `${assetType.charAt(0).toUpperCase() + assetType.slice(1)} Factory`,
              })
            );

            // Initialize deployment progress with first factory in progress
            setDeploymentProgress(
              factories.map((factory, index) => ({
                type: factory.type,
                name: factory.name,
                completed: false,
                inProgress: index === 0, // Start with first factory in progress
              }))
            );

            // Show progress screen and close modal
            setCurrentScreen("progress");
            setShowVerificationModal(false);
            clearStepError("asset-selection");

            try {
              createFactories({
                contract: systemAddress, // Use the actual system address
                factories,
                verification: {
                  verificationCode: otp,
                  verificationType: "two-factor",
                },
              });
            } catch (error) {
              console.error("Factory creation error:", error);
              setVerificationError(
                "Failed to start factory creation. Please try again."
              );
            }
          };

          // Asset type definitions with proper descriptions
          const assetTypes = [
            {
              id: "bond",
              title: "Bonds",
              description:
                "Tokenized debt securities with fixed income features",
              icons: "🔧 🔗",
              requiresConfig: false,
              requiresUnderlying: false,
            },
            {
              id: "equity",
              title: "Equities",
              description: "Digital shares representing ownership in companies",
              icons: "",
              requiresConfig: false,
              requiresUnderlying: false,
            },
            {
              id: "fund",
              title: "Funds",
              description: "Investment fund tokens for pooled investments",
              icons: "",
              requiresConfig: false,
              requiresUnderlying: false,
            },
            {
              id: "stablecoin",
              title: "Stablecoin",
              description: "Price-stable digital currencies",
              icons: "🔗",
              requiresConfig: false,
              requiresUnderlying: true,
            },
            {
              id: "deposit",
              title: "Deposits",
              description: "Tokenized bank deposits and certificates",
              icons: "🔗",
              requiresConfig: false,
              requiresUnderlying: true,
            },
          ];

          const formValues = form.state.values;
          const selectedAssets = formValues.selectedAssetTypes || [];

          // Track selected assets count for button reactivity
          const [selectedAssetsCount, setSelectedAssetsCount] = useState(0);

          const handleDeploy = () => {
            const currentSelectedAssets =
              form.state.values.selectedAssetTypes || [];
            if (currentSelectedAssets.length === 0) {
              toast.error("Please select at least one asset type");
              return;
            }

            if (!isDeploying) {
              setVerificationError(null);
              setShowVerificationModal(true);
            }
          };

          const handleContinue = () => {
            setCurrentScreen("success");
            onNext?.();
          };

          // Show form screen
          if (currentScreen === "form") {
            return (
              <div className="max-w-4xl space-y-6">
                {/* Title */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Configure Supported Asset Types
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define which types of tokenized assets your platform will
                    support.
                  </p>
                </div>

                {/* Body text */}
                <div className="space-y-4 mb-8">
                  <p className="text-sm">
                    Each asset type you support on your platform; like Bonds,
                    Equities, or Stablecoins; is managed by a dedicated Asset
                    Factory.
                  </p>
                  <p className="text-sm">
                    Asset factories are smart contracts that define how a
                    specific asset class behaves on-chain, including its
                    features, rules, and compliance logic.
                  </p>
                  <p className="text-sm">
                    By selecting the asset types you want to support, you'll
                    deploy the necessary smart contracts that power them. You
                    can always add more factories later in your platform
                    settings.
                  </p>
                </div>

                {/* Asset selection grid */}
                <form.Field name="selectedAssetTypes">
                  {(field) => (
                    <div>
                      <h3 className="font-medium mb-4">Select asset types:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {assetTypes.map((asset) => {
                          const currentValue = field.state.value || [];
                          const isSelected =
                            Array.isArray(currentValue) &&
                            currentValue.includes(asset.id);

                          return (
                            <div
                              key={asset.id}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                              onClick={() => {
                                const currentSelection = Array.isArray(
                                  currentValue
                                )
                                  ? currentValue
                                  : [];
                                const newSelection = isSelected
                                  ? currentSelection.filter(
                                      (id) => id !== asset.id
                                    )
                                  : [...currentSelection, asset.id];
                                field.handleChange(newSelection);
                                // Update the count for button reactivity
                                setSelectedAssetsCount(newSelection.length);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-foreground flex items-center gap-2">
                                    {asset.title}
                                    {asset.icons && (
                                      <span className="text-lg">
                                        {asset.icons}
                                      </span>
                                    )}
                                    {asset.requiresConfig && (
                                      <span className="text-xs text-muted-foreground">
                                        🔧
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {asset.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive mt-2">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                    </div>
                  )}
                </form.Field>

                {/* Legend */}
                <div className="mb-6">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>🔧</span>
                      <span>Requires additional configuration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🔗</span>
                      <span>
                        Requires at least one underlying asset type (e.g.
                        Stablecoins or Deposits)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">
                      ⚠️
                    </span>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      This process may take up to 2–3 minutes depending on your
                      selections.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                    <p className="text-sm text-blue-700 dark:text-blue-300 m-0">
                      You'll be asked to confirm each transaction using your PIN
                      or OTP.
                    </p>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end gap-3 pt-6">
                  {!isFirstStep && (
                    <button
                      type="button"
                      onClick={onPrevious}
                      className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDeploy}
                    disabled={selectedAssetsCount === 0}
                    className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deploy Selected Factories
                  </button>
                </div>

                {/* Verification Modal */}
                <VerificationDialog
                  open={showVerificationModal}
                  onOpenChange={setShowVerificationModal}
                  title="Enter your PIN code to continue deployment"
                  description="You're about to deploy the selected asset factories using your wallet. To authorize this critical action, we need you to confirm your identity."
                  hasPincode={hasPincode}
                  hasTwoFactor={hasTwoFactor}
                  isLoading={isDeploying}
                  loadingText="Deploying..."
                  confirmText="Deploy Factories"
                  errorMessage={verificationError}
                  onPincodeSubmit={handlePincodeSubmit}
                  onOtpSubmit={handleOtpSubmit}
                />
              </div>
            );
          }

          // Show progress screen
          if (currentScreen === "progress") {
            return (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    Deploying asset factories
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your selected asset types are being deployed on the
                    blockchain.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-sm">
                    Each asset type requires a dedicated smart contract (Asset
                    Factory). This process may take a few minutes depending on
                    the number of assets and network speed.
                  </p>
                </div>

                <div className="space-y-4">
                  {deploymentProgress.map((factory, index) => (
                    <div
                      key={factory.type}
                      className="flex items-center gap-3 p-4 rounded-lg border"
                    >
                      {factory.completed ? (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
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
                        </div>
                      ) : factory.inProgress ? (
                        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                      )}
                      <div className="flex-1">
                        <span
                          className={`text-sm ${factory.completed ? "text-green-600" : "text-foreground"}`}
                        >
                          {factory.name}
                        </span>
                        {factory.inProgress && latestMessage && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {latestMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // Show success screen
          return (
            <>
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
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
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Asset factories deployed successfully
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    All selected asset factories have been successfully
                    deployed. You are now the initial administrator of these
                    factories.
                  </p>
                </div>

                {/* Deployment Details - expandable section */}
                <div className="text-left space-y-4">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 underline"
                    onClick={() => {
                      // This would toggle deployment details visibility
                      // For now, we'll show them by default
                    }}
                  >
                    [View Deployment Details] will toggle deployment details
                  </button>

                  <div className="space-y-3 text-sm">
                    {deploymentProgress.map((factory, index) => (
                      <div
                        key={factory.type}
                        className="flex items-center gap-2"
                      >
                        <span>•</span>
                        <span>Factory {index + 1}: 0xabc123... [copy]</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <span>•</span>
                      <span>Deployment transaction: 0xtranshash... [copy]</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={handleContinue}
                    className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Configure add-ons
                  </button>
                </div>
              </div>

              {/* Verification Modal */}
              <VerificationDialog
                open={showVerificationModal}
                onOpenChange={setShowVerificationModal}
                title="Enter your PIN code to continue deployment"
                description="You're about to deploy the selected asset factories using your wallet. To authorize this critical action, we need you to confirm your identity."
                hasPincode={hasPincode}
                hasTwoFactor={hasTwoFactor}
                isLoading={isDeploying}
                loadingText="Deploying..."
                confirmText="Deploy Factories"
                errorMessage={verificationError}
                onPincodeSubmit={handlePincodeSubmit}
                onOtpSubmit={handleOtpSubmit}
              />
            </>
          );
        },
      });

      // 4. Enable platform addons
      dynamicSteps.push({
        id: "enable-platform-addons",
        title: "Enable platform addons",
        description: "Choose additional features and capabilities",
        groupId: "system",
        fields: [
          {
            name: "selectedAddons",
            label: "Platform Addons",
            type: "checkbox",
            description: "Select optional features to enhance your platform",
            options: [
              { label: "Airdrops", value: "airdrops" },
              { label: "Cross-chain Value Transfer (XVP)", value: "xvp" },
              { label: "Yield Farming", value: "yield" },
              { label: "Governance", value: "governance" },
              { label: "Analytics Dashboard", value: "analytics" },
            ],
          },
        ],
      });
    }

    if (shouldShowIdentitySteps) {
      // 1. Create your ONCHAINID
      dynamicSteps.push({
        id: "create-onchainid",
        title: "Create your ONCHAINID",
        description: "Generate your blockchain identity for compliance",
        groupId: "identity",
        fields: [],
        onStepComplete: async () => Promise.resolve(),
        component: ({ onNext, onPrevious, isFirstStep, isLastStep }) => (
          <div className="max-w-2xl space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Create your ONCHAINID
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your ONCHAINID is a unique blockchain identity that enables
                secure, compliant asset transactions. This identity will be
                linked to your wallet and verified through our compliance
                system.
              </p>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
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
                  <div className="flex-1">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Creating your ONCHAINID will deploy a smart contract
                      representing your identity on the blockchain. This is
                      required for all compliant asset transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              {!isFirstStep && (
                <button
                  onClick={onPrevious}
                  className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                >
                  Previous
                </button>
              )}
              <button
                onClick={onNext}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Create ONCHAINID
              </button>
            </div>
          </div>
        ),
      });

      // 2. Add personal information
      dynamicSteps.push({
        id: "add-personal-information",
        title: "Add personal information",
        description: "Provide KYC information for compliance verification",
        groupId: "identity",
        fields: [
          {
            name: "firstName",
            label: "First Name",
            type: "text",
            description: "Enter your legal first name",
          },
          {
            name: "lastName",
            label: "Last Name",
            type: "text",
            description: "Enter your legal last name",
          },
          {
            name: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            description: "Enter your date of birth",
          },
          {
            name: "nationality",
            label: "Nationality",
            type: "select",
            description: "Select your nationality",
            options: [
              { label: "United States", value: "US" },
              { label: "United Kingdom", value: "GB" },
              { label: "Germany", value: "DE" },
              { label: "France", value: "FR" },
              { label: "Japan", value: "JP" },
              { label: "Canada", value: "CA" },
              { label: "Australia", value: "AU" },
              { label: "Other", value: "OTHER" },
            ],
          },
          {
            name: "residenceCountry",
            label: "Country of Residence",
            type: "select",
            description: "Select your country of residence",
            options: [
              { label: "United States", value: "US" },
              { label: "United Kingdom", value: "GB" },
              { label: "Germany", value: "DE" },
              { label: "France", value: "FR" },
              { label: "Japan", value: "JP" },
              { label: "Canada", value: "CA" },
              { label: "Australia", value: "AU" },
              { label: "Other", value: "OTHER" },
            ],
          },
          {
            name: "investorType",
            label: "Investor Type",
            type: "select",
            description: "Select your investor classification",
            options: [
              { label: "Retail Investor", value: "retail" },
              { label: "Professional Investor", value: "professional" },
              { label: "Institutional Investor", value: "institutional" },
            ],
          },
        ],
        validate: (data) => {
          const errors: string[] = [];
          if (!data.firstName?.trim()) errors.push("First name is required");
          if (!data.lastName?.trim()) errors.push("Last name is required");
          if (!data.dateOfBirth) errors.push("Date of birth is required");
          if (!data.nationality) errors.push("Nationality is required");
          if (!data.residenceCountry)
            errors.push("Country of residence is required");
          if (!data.investorType) errors.push("Investor type is required");
          return errors.length > 0 ? errors.join(", ") : undefined;
        },
      });
    }

    return dynamicSteps;
  }, [
    shouldShowWalletSteps,
    shouldShowSystemSetupSteps,
    shouldShowIdentitySteps,
    systemAddress,
    user,
  ]);

  const defaultValues: Partial<OnboardingFormData> = useMemo(
    () => ({
      walletGenerated: Boolean(user?.wallet),
      walletAddress: user?.wallet,
      walletSecured: false,
      systemBootstrapped: Boolean(systemAddress),
      systemAddress: systemAddress ?? undefined,
      baseCurrency: (currentBaseCurrency ||
        "USD") as OnboardingFormData["baseCurrency"],
      assetFactoriesDeployed: (systemDetails?.tokenFactories.length ?? 0) > 0,
      selectedAssetTypes: [],
      selectedAddons: [],
      kycCompleted: false,
      identityRegistered: false,
    }),
    [user, systemAddress, systemDetails, currentBaseCurrency]
  );

  return { groups, steps, defaultValues, onboardingSchema };
}
