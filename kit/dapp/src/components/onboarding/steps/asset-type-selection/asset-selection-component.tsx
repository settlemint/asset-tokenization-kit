import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Link, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/auth.client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { orpc } from "@/orpc";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { useSettings } from "@/hooks/use-settings";
import { useWizardContext } from "@/components/multistep-form/wizard-context";
import { VerificationDialog } from "@/components/ui/verification-dialog";
import { AssetTypeCheckbox } from "./asset-type-checkbox";
import type { SystemReadOutput } from "@/orpc/routes/system/routes/system.read.schema";

const logger = createLogger();

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
  const selectedTypes = useMemo(
    () => field.state.value ?? [],
    [field.state.value]
  );

  const handleToggle = useCallback(
    (assetType: string) => {
      const currentSelection = selectedTypes;
      const isSelected = currentSelection.includes(assetType);

      if (isSelected) {
        field.handleChange(
          currentSelection.filter((type) => type !== assetType)
        );
      } else {
        field.handleChange([...currentSelection, assetType]);
      }
    },
    [selectedTypes, field]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {assetTypes.map((assetType) => (
          <AssetTypeCheckbox
            key={assetType.value}
            assetType={assetType}
            isSelected={selectedTypes.includes(assetType.value)}
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

// Main Asset Selection Component
export function AssetSelectionComponent({
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
  const { t } = useTranslation(["onboarding", "general", "tokens"]);
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
  }) as { data: SystemReadOutput | undefined; isLoading: boolean };

  const assetTypes = useMemo(
    () => [
      {
        value: "bond",
        label: (
          t as (key: string, options?: Record<string, unknown>) => string
        )(`asset-types.bond`, { ns: "tokens" }),
        description: (t as (key: string) => string)(`assets.descriptions.bond`),
      },
      {
        value: "equity",
        label: (
          t as (key: string, options?: Record<string, unknown>) => string
        )(`asset-types.equity`, { ns: "tokens" }),
        description: (t as (key: string) => string)(
          `assets.descriptions.equity`
        ),
      },
      {
        value: "fund",
        label: (
          t as (key: string, options?: Record<string, unknown>) => string
        )(`asset-types.fund`, { ns: "tokens" }),
        description: (t as (key: string) => string)(`assets.descriptions.fund`),
      },
      {
        value: "stablecoin",
        label: (
          t as (key: string, options?: Record<string, unknown>) => string
        )(`asset-types.stablecoin`, { ns: "tokens" }),
        description: (t as (key: string) => string)(
          `assets.descriptions.stablecoin`
        ),
      },
      {
        value: "deposit",
        label: (
          t as (key: string, options?: Record<string, unknown>) => string
        )(`asset-types.deposit`, { ns: "tokens" }),
        description: (t as (key: string) => string)(
          `assets.descriptions.deposit`
        ),
      },
    ],
    [t]
  );

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
        if (!systemDetails?.identityRegistry || !systemDetails.compliance) {
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
        const typedType = type as
          | "bond"
          | "equity"
          | "fund"
          | "stablecoin"
          | "deposit";

        return {
          type: typedType,
          name: (
            t as (key: string, options?: Record<string, unknown>) => string
          )(`asset-types.${typedType}`, { ns: "tokens" }),
        };
      });

      setVerificationError(null);

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

      // Use token factory registry address from system details
      const contractAddress = systemDetails.tokenFactoryRegistry;

      if (!contractAddress) {
        logger.error("Token factory registry not found in system details", {
          systemAddress,
          systemDetails,
        });
        // If no token factory registry, this likely means system isn't fully bootstrapped
        setVerificationError(
          "Token factory registry not found. Please ensure the system is properly bootstrapped."
        );
        return;
      }

      // Verify system is ready for factory creation
      if (
        !systemDetails.identityRegistry ||
        !systemDetails.compliance ||
        !systemDetails.tokenFactoryRegistry
      ) {
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
        tokenFactoryRegistryAddress: contractAddress,
        factories,
        verification: {
          verificationCode: "***",
          verificationType,
        },
        systemAddress,
        tokenFactoryRegistry: systemDetails.tokenFactoryRegistry,
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
      t,
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
          <BadgeCheck className="h-4 w-4" />
          <span>Requires additional configuration</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link className="h-4 w-4" />
          <span>
            Requires at least one underlying asset type (e.g. Stablecoins or
            Deposits)
          </span>
        </div>

        {/* Warning box */}
        <div className="rounded-lg bg-sm-state-warning-background/50 border border-sm-state-warning-background p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-sm-state-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-sm-state-warning">
                This process may take up to 2–3 minutes depending on your
                selections.
              </p>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-primary">
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
