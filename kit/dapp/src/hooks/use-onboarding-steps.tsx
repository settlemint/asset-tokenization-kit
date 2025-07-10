import type {
  StepDefinition,
  StepGroup,
} from "@/components/multistep-form/types";
import { RecoveryCodesStep } from "@/components/onboarding/steps/recovery-codes-step";
import { SystemBootstrapStep } from "@/components/onboarding/steps/system-bootstrap-step";
import { WalletDisplayStep } from "@/components/onboarding/steps/wallet-display-step";
import { WalletSecurityStep } from "@/components/onboarding/steps/wallet-security-step";

import React, { useMemo, useCallback, useState, useEffect } from "react";
import { z } from "zod/v4";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import {
  fiatCurrency,
  fiatCurrencyMetadata,
} from "@/lib/zod/validators/fiat-currency";
import { useWizardContext } from "@/components/multistep-form/wizard-context";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { orpc } from "@/orpc";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { VerificationDialog } from "@/components/ui/verification-dialog";
import { authClient } from "@/lib/auth/auth.client";
import { createLogger } from "@settlemint/sdk-utils/logging";

const logger = createLogger();

// Currency Field Component
function CurrencyField({
  field,
}: {
  field: {
    state: { value?: string; meta: { errors?: string[] } };
    handleChange: (value: string) => void;
  };
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      field.handleChange(e.target.value);
    },
    [field]
  );

  return (
    <div className="space-y-2">
      <label htmlFor="baseCurrency" className="text-sm font-medium">
        Base Currency
      </label>
      <p className="text-sm text-muted-foreground">
        Choose the default currency for your platform
      </p>
      <select
        id="baseCurrency"
        value={field.state.value ?? "USD"}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(fiatCurrencyMetadata).map(([code, metadata]) => (
          <option key={code} value={code}>
            {metadata.name} ({code})
          </option>
        ))}
      </select>
      {field.state.meta.errors && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive mt-2">
          {field.state.meta.errors[0]}
        </p>
      )}
    </div>
  );
}

// Asset Selection Component
function AssetSelectionComponent({
  form,
  onNext,
  onPrevious,
  isFirstStep,
}: {
  form: {
    state: {
      values: {
        selectedAssetTypes?: string[];
      };
    };
    Field: (props: {
      name: string;
      children: (field: {
        state: { value?: string[]; meta: { errors?: string[] } };
        handleChange: (value: string[]) => void;
      }) => React.ReactNode;
    }) => React.ReactNode;
  };
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
}) {
  const { clearStepError, markStepComplete } = useWizardContext();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  // State for verification modal and deployment progress
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Get user security settings
  const currentUser = session?.user;
  const hasPincode = currentUser?.pincodeEnabled ?? false;
  const hasTwoFactor = currentUser?.twoFactorEnabled ?? false;

  // Get system address from settings
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");

  // Check system bootstrap status
  const { data: systemDetails, isLoading: isLoadingSystem } = useQuery({
    ...orpc.system.read.queryOptions({ input: { id: systemAddress ?? "" } }),
    enabled: !!systemAddress,
  });

  const assetTypes = [
    {
      value: "bond",
      label: "Bonds",
      description: "Tokenized debt securities with fixed income features",
    },
    {
      value: "equity",
      label: "Equities",
      description: "Digital shares representing ownership in companies",
    },
    {
      value: "fund",
      label: "Funds",
      description: "Investment fund tokens for pooled investments",
    },
    {
      value: "stablecoin",
      label: "Stablecoin",
      description: "Price-stable digital currencies",
    },
    {
      value: "deposit",
      label: "Deposits",
      description: "Tokenized bank deposits and certificates",
    },
  ];

  const handleConfirm = useCallback(() => {
    try {
      clearStepError("asset-selection");
      const formValues = form.state.values;
      if (
        formValues.selectedAssetTypes &&
        formValues.selectedAssetTypes.length > 0
      ) {
        // Check if system is bootstrapped before allowing factory deployment
        if (!systemAddress) {
          toast.error("System must be bootstrapped before deploying factories");
          return;
        }

        // Show verification modal for PIN/OTP input
        setVerificationError(null);
        setShowVerificationModal(true);
      } else {
        toast.error("Please select at least one asset type");
        return;
      }
    } catch {
      toast.error("Failed to save asset selection");
    }
  }, [form.state.values, clearStepError, systemAddress]);

  // Factory deployment mutation
  const {
    mutate: deployFactories,
    isPending: isDeploying,
    error: deploymentError,
  } = useStreamingMutation({
    mutationOptions: orpc.token.factoryCreate.mutationOptions(),
    onSuccess: async () => {
      setShowVerificationModal(false);
      setVerificationError(null);
      markStepComplete("asset-selection");
      toast.success("Factories deployed successfully!");
      await queryClient.invalidateQueries();
      onNext?.();
    },
  });

  // Handle deployment errors
  useEffect(() => {
    if (deploymentError) {
      logger.error("Factory deployment error:", {
        error: deploymentError,
        errorName: deploymentError.name,
        errorMessage: deploymentError.message,
        errorStack: deploymentError.stack,
        errorCause: deploymentError.cause,
      });

      const errorMessage =
        deploymentError instanceof Error
          ? deploymentError.message
          : String(deploymentError);

      // Check for specific error types
      if (errorMessage.includes("SystemNotBootstrapped")) {
        setVerificationError(
          "System not bootstrapped. Please complete system deployment first."
        );
      } else if (errorMessage.includes("Factory already exists")) {
        setVerificationError(
          "Factory with this name already exists. Please try again."
        );
      } else if (errorMessage.includes("verification")) {
        setVerificationError(
          "Authentication failed. Please check your PIN/OTP and try again."
        );
      } else if (errorMessage.includes("Failed to create token factory")) {
        // Check if this is a system bootstrap issue
        if (!systemDetails.identityRegistry || !systemDetails.compliance) {
          setVerificationError(
            "System bootstrap incomplete. Please complete the system setup first before creating factories."
          );
        } else {
          setVerificationError(
            "Factory creation failed. This may be due to a blockchain transaction error or network issue. Please try again."
          );
        }
      } else {
        setVerificationError(`Factory deployment failed: ${errorMessage}`);
      }
    }
  }, [deploymentError, systemDetails]);

  // Handle PIN/OTP verification and factory deployment
  const handleVerificationSubmit = useCallback(
    (verificationCode: string, verificationType: "pincode" | "two-factor") => {
      const formValues = form.state.values;
      if (
        !formValues.selectedAssetTypes ||
        formValues.selectedAssetTypes.length === 0
      ) {
        setVerificationError("No asset types selected");
        return;
      }

      // Convert selected asset types to factory creation format
      const factories = formValues.selectedAssetTypes.map((type) => {
        // Use unique names with timestamp to avoid conflicts
        const timestamp = Date.now();
        const factoryNames = {
          bond: `Bond Factory ${timestamp}`,
          equity: `Equity Factory ${timestamp}`,
          fund: `Fund Factory ${timestamp}`,
          stablecoin: `Stablecoin Factory ${timestamp}`,
          deposit: `Deposit Factory ${timestamp}`,
        };

        // Default implementation addresses from SettleMint deployment
        const defaultImplementations = {
          bond: {
            factoryImplementation: "0x5e771e1417100000000000000000000000020021",
            tokenImplementation: "0x5e771e1417100000000000000000000000020020",
          },
          equity: {
            factoryImplementation: "0x5e771e1417100000000000000000000000020025",
            tokenImplementation: "0x5e771e1417100000000000000000000000020024",
          },
          fund: {
            factoryImplementation: "0x5e771e1417100000000000000000000000020027",
            tokenImplementation: "0x5e771e1417100000000000000000000000020026",
          },
          stablecoin: {
            factoryImplementation: "0x5e771e1417100000000000000000000000020029",
            tokenImplementation: "0x5e771e1417100000000000000000000000020028",
          },
          deposit: {
            factoryImplementation: "0x5e771e1417100000000000000000000000020023",
            tokenImplementation: "0x5e771e1417100000000000000000000000020022",
          },
        };

        const typedType = type as
          | "bond"
          | "equity"
          | "fund"
          | "stablecoin"
          | "deposit";
        const implementations = defaultImplementations[typedType];

        return {
          type: typedType,
          name:
            factoryNames[typedType] ||
            `${type.charAt(0).toUpperCase() + type.slice(1)} Factory`,
          factoryImplementation: implementations.factoryImplementation,
          tokenImplementation: implementations.tokenImplementation,
        };
      });

      setVerificationError(null);

      // Use system address or fall back to default
      const contractAddress =
        systemAddress ?? "0x5e771e1417100000000000000000000000020088";

      if (!systemAddress) {
        logger.warn("No system address found, using default contract address", {
          defaultAddress: contractAddress,
        });
        // If no system address, this likely means system isn't bootstrapped
        setVerificationError(
          "System not bootstrapped. Please complete system deployment first."
        );
        return;
      }

      // Check if system is properly bootstrapped and ready for factory creation
      if (isLoadingSystem) {
        setVerificationError("Loading system information. Please wait...");
        return;
      }

      if (!systemDetails) {
        logger.error("System details not found for address:", {
          systemAddress,
        });
        setVerificationError(
          "System not found. Please ensure the system is properly bootstrapped."
        );
        return;
      }

      // Verify system is ready for factory creation
      if (!systemDetails.identityRegistry || !systemDetails.compliance) {
        logger.error(
          "System bootstrap incomplete. Missing required components:",
          {
            systemAddress,
            hasIdentityRegistry: !!systemDetails.identityRegistry,
            hasCompliance: !!systemDetails.compliance,
            hasTokenFactoryRegistry: !!systemDetails.tokenFactoryRegistry,
            hasTrustedIssuersRegistry: !!systemDetails.trustedIssuersRegistry,
          }
        );
        setVerificationError(
          "System bootstrap incomplete. Please wait for system initialization to complete."
        );
        return;
      }

      logger.info("Deploying factories with parameters:", {
        contract: contractAddress,
        factories,
        verification: {
          verificationCode: "***",
          verificationType,
        },
        systemAddressSource: systemAddress ? "from settings" : "using default",
        systemAddress,
        userWallet: session?.user.wallet ?? "no wallet",
        userSession: !!session?.user,
        factoryCount: factories.length,
        factoryTypes: factories.map((f) => f.type),
      });

      // Deploy factories using the mutation
      deployFactories({
        contract: contractAddress,
        factories,
        verification: {
          verificationCode,
          verificationType,
        },
      });
    },
    [
      form.state.values,
      systemAddress,
      deployFactories,
      session?.user,
      isLoadingSystem,
      systemDetails,
    ]
  );

  // Create stable callback references for verification dialog
  const handlePincodeSubmit = useCallback(
    (pincode: string) => {
      handleVerificationSubmit(pincode, "pincode");
    },
    [handleVerificationSubmit]
  );

  const handleOtpSubmit = useCallback(
    (otp: string) => {
      handleVerificationSubmit(otp, "two-factor");
    },
    [handleVerificationSubmit]
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Configure Supported Asset Types
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Define which types of tokenized assets your platform will support.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <p className="text-sm">
          Each asset type you support on your platform; like Bonds, Equities, or
          Stablecoins; is managed by a dedicated Asset Factory.
        </p>
        <p className="text-sm">
          Asset factories are smart contracts that define how a specific asset
          class behaves on-chain, including its features, rules, and compliance
          logic.
        </p>
        <p className="text-sm">
          By selecting the asset types you want to support, you'll deploy the
          necessary smart contracts that power them. You can always add more
          factories later in your platform settings.
        </p>
      </div>

      <div className="mb-4">
        <h3 className="text-base font-medium text-foreground">
          Select asset types:
        </h3>
      </div>

      <form.Field name="selectedAssetTypes">
        {(field: {
          state: { value?: string[]; meta: { errors?: string[] } };
          handleChange: (value: string[]) => void;
        }) => <AssetTypeCheckboxes field={field} assetTypes={assetTypes} />}
      </form.Field>

      {/* Additional information section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Requires additional configuration</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span>
            Requires at least one underlying asset type (e.g. Stablecoins or
            Deposits)
          </span>
        </div>

        {/* Warning box */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                This process may take up to 2–3 minutes depending on your
                selections.
              </p>
            </div>
          </div>
        </div>

        {/* Info box */}
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
                You'll be asked to confirm each transaction using your PIN or
                OTP.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        {!isFirstStep && (
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
            disabled={isDeploying}
          >
            Previous
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          disabled={isDeploying}
        >
          {isDeploying ? "Deploying..." : "Deploy Selected Factories"}
        </button>
      </div>

      {/* Verification Modal */}
      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        title="Enter your PIN code to deploy factories"
        description="You're about to deploy asset factories to the blockchain. To authorize this action, we need you to confirm your identity."
        hasPincode={hasPincode}
        hasTwoFactor={hasTwoFactor}
        isLoading={isDeploying}
        loadingText="Deploying factories..."
        confirmText="Deploy Factories"
        errorMessage={verificationError}
        onPincodeSubmit={handlePincodeSubmit}
        onOtpSubmit={handleOtpSubmit}
      />
    </div>
  );
}

// Individual Asset Type Checkbox Component
function AssetTypeCheckbox({
  assetType,
  isSelected,
  onToggle,
}: {
  assetType: {
    value: string;
    label: string;
    description: string;
  };
  isSelected: boolean;
  onToggle: (value: string) => void;
}) {
  const handleToggle = useCallback(() => {
    onToggle(assetType.value);
  }, [onToggle, assetType.value]);

  return (
    <div
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onClick={handleToggle}
    >
      <div>
        <h4 className="font-medium text-foreground flex items-center gap-2">
          {assetType.label}
          {assetType.value === "bond" && (
            <>
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <svg
                className="h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </>
          )}
          {(assetType.value === "stablecoin" ||
            assetType.value === "deposit") && (
            <svg
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          )}
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          {assetType.description}
        </p>
      </div>
    </div>
  );
}

// Asset Type Checkboxes Component
function AssetTypeCheckboxes({
  field,
  assetTypes,
}: {
  field: {
    state: { value?: string[]; meta: { errors?: string[] } };
    handleChange: (value: string[]) => void;
  };
  assetTypes: {
    value: string;
    label: string;
    description: string;
  }[];
}) {
  const selectedValues = useMemo(
    () => field.state.value ?? [],
    [field.state.value]
  );

  const handleToggle = useCallback(
    (assetType: string) => {
      const newValues = selectedValues.includes(assetType)
        ? selectedValues.filter((type) => type !== assetType)
        : [...selectedValues, assetType];
      field.handleChange(newValues);
    },
    [selectedValues, field]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assetTypes.map((assetType) => (
          <AssetTypeCheckbox
            key={assetType.value}
            assetType={assetType}
            isSelected={selectedValues.includes(assetType.value)}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {field.state.meta.errors && field.state.meta.errors.length > 0 && (
        <p className="text-sm text-destructive mt-2">
          {field.state.meta.errors[0]}
        </p>
      )}
    </div>
  );
}

// Platform Settings Component
function PlatformSettingsComponent({
  form,
  onNext,
  onPrevious,
  isFirstStep,
}: {
  form: {
    state: {
      values: {
        baseCurrency?: string;
      };
    };
    Field: (props: {
      name: string;
      children: (field: {
        state: { value?: string; meta: { errors?: string[] } };
        handleChange: (value: string) => void;
      }) => React.ReactNode;
    }) => React.ReactNode;
  };
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
}) {
  const [, setBaseCurrency] = useSettings("BASE_CURRENCY");
  const { clearStepError, markStepComplete } = useWizardContext();

  const handleConfirm = useCallback(() => {
    try {
      clearStepError("configure-platform-settings");
      const formValues = form.state.values;
      if (formValues.baseCurrency) {
        setBaseCurrency(formValues.baseCurrency);
        markStepComplete("configure-platform-settings");
        toast.success("Platform settings saved successfully");
      }
      onNext?.();
    } catch {
      toast.error("Failed to save platform settings");
    }
  }, [
    form.state.values,
    setBaseCurrency,
    clearStepError,
    markStepComplete,
    onNext,
  ]);

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
          Before you begin issuing assets, let's configure some basic settings
          that determine how the platform behaves. These default values help
          personalize the experience for you and your users.
        </p>
        <p className="text-sm">
          You can update these preferences later in the platform settings.
        </p>
      </div>

      <form.Field name="baseCurrency">
        {(field: {
          state: { value?: string; meta: { errors?: string[] } };
          handleChange: (value: string) => void;
        }) => <CurrencyField field={field} />}
      </form.Field>

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
          onClick={handleConfirm}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}

// Asset Selection Component - removed to fix React hooks violations
// The complete implementation has been moved to a simple inline component
// to avoid hooks violations within the useMemo

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
        component: (props) => <PlatformSettingsComponent {...props} />,
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
        component: (props) => <AssetSelectionComponent {...props} />,
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
        component: ({ onNext, onPrevious, isFirstStep }) => (
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
            type: "text",
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
    user,
  ]);

  const defaultValues: Partial<OnboardingFormData> = useMemo(
    () => ({
      walletGenerated: Boolean(user?.wallet),
      walletAddress: user?.wallet,
      walletSecured: false,
      systemBootstrapped: Boolean(systemAddress),
      systemAddress: systemAddress ?? undefined,
      baseCurrency: (currentBaseCurrency ??
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
