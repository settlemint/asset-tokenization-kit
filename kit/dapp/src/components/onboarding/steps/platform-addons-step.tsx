import { useWizardContext } from "@/components/multistep-form/wizard-context";
import { Checkbox } from "@/components/ui/checkbox";
import { VerificationDialog } from "@/components/ui/verification-dialog";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, MoreHorizontal, TrendingUp, Zap } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const logger = createLogger();

/**
 * Addon type definitions with descriptions
 */
const addonDefinitions = [
  {
    id: "airdrops",
    label: "Airdrops",
    description: "Distribute tokens to users automatically",
    icon: Zap,
    isRequired: undefined,
  },
  {
    id: "yield",
    label: "Fixed Yield",
    description: "Handle interest payouts on bonds and similar assets.",
    icon: TrendingUp,
    isRequired: (selectedAssetTypes: string[]) =>
      selectedAssetTypes.includes("bond"),
  },
  {
    id: "xvp",
    label: "XVP",
    description: "Enable exchange and value pool features",
    icon: ArrowLeftRight,
    isRequired: undefined,
  },
] as const;

/**
 * Platform Add-ons Step Component
 *
 * Allows users to select and deploy platform add-ons with PIN verification
 * and real-time progress tracking.
 */
export const PlatformAddonsComponent = memo(function PlatformAddonsComponent({
  onNext,
  onPrevious,
  isFirstStep,
}: {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
}) {
  const { form } = useWizardContext();
  const { data: session } = authClient.useSession();
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");
  const queryClient = useQueryClient();

  // State for verification dialog
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Check if user has 2FA enabled to determine available verification methods
  const hasTwoFactor = session?.user.twoFactorEnabled ?? false;
  const hasPincode = session?.user.pincodeEnabled ?? false;

  // Fetch system details to get system information
  const { data: systemDetails, isLoading: isLoadingSystem } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: !!systemAddress,
  });

  // Get selected asset types from the form to determine required addons
  const selectedAssetTypes = useMemo(
    () => form.state.values.selectedAssetTypes ?? [],
    [form.state.values.selectedAssetTypes]
  );

  // Check if any addon is required based on selected asset types
  const hasRequiredAddons = addonDefinitions.some((addon) =>
    addon.isRequired?.(selectedAssetTypes)
  );

  // Get required addons
  const requiredAddons = addonDefinitions.filter((addon) =>
    addon.isRequired?.(selectedAssetTypes)
  );

  // Addon deployment mutation
  const { mutate: deployAddons, isPending: isDeploying } = useStreamingMutation(
    {
      mutationOptions: orpc.system.addonCreate.mutationOptions(),
      onSuccess: async () => {
        setShowVerificationModal(false);
        setVerificationError(null);
        toast.success("Add-ons deployed successfully!");
        await queryClient.invalidateQueries();
      },
    }
  );

  // Handle addon selection/deselection
  const handleAddonToggle = useCallback(
    (addonId: string, isSelected: boolean) => {
      return (field: {
        state: { value?: string[]; meta: { errors?: string[] } };
        handleChange: (value: string[]) => void;
      }) => {
        const currentValue = field.state.value ?? [];

        if (isSelected) {
          // Add addon if not already present
          if (!currentValue.includes(addonId)) {
            field.handleChange([...currentValue, addonId]);
          }
        } else {
          // Check if this is a required addon
          const addon = addonDefinitions.find((a) => a.id === addonId);
          if (addon?.isRequired?.(selectedAssetTypes)) {
            toast.warning(
              `${addon.label} is required because you selected Bond assets`
            );
            return;
          }

          // Remove addon
          field.handleChange(
            currentValue.filter((id: string) => id !== addonId)
          );
        }
      };
    },
    [selectedAssetTypes]
  );

  // Handle deploy button click
  const handleDeploy = useCallback(() => {
    try {
      const formValues = form.state.values;
      const selectedAddons = formValues.selectedPlatformAddons ?? [];

      if (selectedAddons.length === 0 && !hasRequiredAddons) {
        toast.error("Please select at least one add-on to deploy");
        return;
      }

      // Check if system is bootstrapped before allowing addon deployment
      if (!systemAddress) {
        toast.error("System must be bootstrapped before deploying add-ons");
        return;
      }

      if (!systemDetails) {
        toast.error(
          "System details not found. Please ensure the system is properly bootstrapped."
        );
        return;
      }

      // Show verification modal for PIN/OTP input
      setVerificationError(null);
      setShowVerificationModal(true);
    } catch (error) {
      toast.error("Failed to initiate add-on deployment");
      logger.error("Add-on deployment preparation failed:", error);
    }
  }, [form.state.values, hasRequiredAddons, systemAddress, systemDetails]);

  // Handle PIN/OTP verification and addon deployment
  const handleVerificationSubmit = useCallback(
    (verificationCode: string, verificationType: "pincode" | "two-factor") => {
      const formValues = form.state.values;
      const selectedAddons = formValues.selectedPlatformAddons ?? [];

      // Include required addons automatically
      const allRequiredAddonIds = requiredAddons.map((addon) => addon.id);
      const finalAddonIds = [
        ...new Set([...selectedAddons, ...allRequiredAddonIds]),
      ];

      if (finalAddonIds.length === 0) {
        setVerificationError("No add-ons selected for deployment");
        return;
      }

      // Convert selected addon IDs to addon configurations
      const addonConfigs = finalAddonIds.map((addonId) => {
        const addon = addonDefinitions.find((a) => a.id === addonId);
        if (!addon) {
          throw new Error(`Unknown addon type: ${addonId}`);
        }

        return {
          type: addonId as "airdrops" | "yield" | "xvp",
          name: addon.label,
        };
      });

      setVerificationError(null);

      // Check if system is properly bootstrapped and ready for addon deployment
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

      // Use the system addon registry address - this is the correct contract for addon registration
      const contractAddress = systemDetails.systemAddonRegistry;

      if (!contractAddress) {
        logger.error("System addon registry address not found", {
          systemAddress,
          systemDetails,
          systemAddonRegistry: systemDetails.systemAddonRegistry,
        });
        setVerificationError(
          "System addon registry not found. Please ensure the system is properly bootstrapped."
        );
        return;
      }

      logger.info("Deploying add-ons with parameters:", {
        addonRegistryAddress: contractAddress,
        systemAddress,
        addonConfigs,
        verification: {
          verificationCode: "***",
          verificationType,
        },
        userWallet: session?.user.wallet ?? "no wallet",
        userSession: !!session?.user,
        addonCount: addonConfigs.length,
        addonTypes: addonConfigs.map((a) => a.type),
        hasSystemDetails: !!systemDetails,
        systemDetailsKeys: Object.keys(systemDetails),
      });

      // Deploy addons using the mutation
      try {
        deployAddons({
          contract: contractAddress,
          addons: addonConfigs,
          verification: {
            verificationCode,
            verificationType,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        logger.error("Addon deployment failed:", {
          error,
          errorMessage,
          errorStack,
          systemAddress,
          hasSystemDetails: !!systemDetails,
        });

        // Provide more specific error messages based on the error
        let userMessage = "Failed to deploy add-ons. Please try again.";

        if (
          errorMessage.includes("not found") ||
          errorMessage.includes("not exist")
        ) {
          userMessage =
            "System addon registry not found. Please ensure the system is properly configured.";
        } else if (
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("permission")
        ) {
          userMessage =
            "You don't have permission to deploy add-ons. Please check your access rights.";
        } else if (
          errorMessage.includes("verification") ||
          errorMessage.includes("invalid code")
        ) {
          userMessage =
            "Invalid verification code. Please check your PIN/OTP and try again.";
        } else if (errorMessage) {
          userMessage = errorMessage;
        }

        setVerificationError(userMessage);
        toast.error(userMessage);
      }
    },
    [
      form.state.values,
      requiredAddons,
      systemAddress,
      deployAddons,
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

  // Create addon toggle handler outside of Field render function
  const createAddonHandlers = useCallback(
    (
      addon: (typeof addonDefinitions)[number],
      isSelected: boolean,
      isRequired: boolean,
      field: {
        state: { value?: string[]; meta: { errors?: string[] } };
        handleChange: (value: string[]) => void;
      }
    ) => {
      const handleContainerClick = () => {
        if (isRequired || isDeploying) return;

        const newCheckedState = !isSelected;
        handleAddonToggle(addon.id, newCheckedState)(field);
      };

      const handleCheckboxClick = (e: React.MouseEvent) => {
        // Prevent the container click from firing when clicking directly on checkbox
        e.stopPropagation();
      };

      const handleCheckboxChange = (checked: boolean) => {
        handleAddonToggle(addon.id, checked)(field);
      };

      return {
        handleContainerClick,
        handleCheckboxClick,
        handleCheckboxChange,
      };
    },
    [isDeploying, handleAddonToggle]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Configure Platform Add-ons</h2>
        <p className="text-muted-foreground">
          Enhance your platform with optional features.
        </p>
        <p className="text-sm text-muted-foreground">
          Platform add-ons are smart contracts that extend your platform's
          functionality. Select the ones you need for your use case.
        </p>
      </div>

      {hasRequiredAddons && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Required Add-ons</h3>
          <p className="text-sm text-blue-700 mb-2">
            Based on your selected asset types, these add-ons are required:
          </p>
          <ul className="text-sm text-blue-700 list-disc list-inside">
            {requiredAddons.map((addon) => (
              <li key={addon.id}>
                <strong>{addon.label}</strong> - {addon.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form.Field name="selectedPlatformAddons">
        {(field: {
          state: { value?: string[]; meta: { errors?: string[] } };
          handleChange: (value: string[]) => void;
        }) => (
          <div className="space-y-4">
            <div className="grid gap-4">
              {addonDefinitions.map((addon) => {
                const isRequired = addon.isRequired
                  ? addon.isRequired(selectedAssetTypes)
                  : false;
                const isSelected = (field.state.value ?? []).includes(addon.id);
                const IconComponent = addon.icon;

                const {
                  handleContainerClick,
                  handleCheckboxClick,
                  handleCheckboxChange,
                } = createAddonHandlers(addon, isSelected, isRequired, field);

                return (
                  <div
                    key={addon.id}
                    className={`relative flex items-start space-x-3 rounded-lg border p-4 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    } ${isRequired ? "ring-2 ring-blue-200" : ""} ${
                      isRequired || isDeploying
                        ? "cursor-not-allowed opacity-75"
                        : "hover:bg-muted/50 cursor-pointer"
                    }`}
                    onClick={handleContainerClick}
                  >
                    <div onClick={handleCheckboxClick}>
                      <Checkbox
                        checked={isSelected || isRequired}
                        disabled={isRequired || isDeploying}
                        onCheckedChange={handleCheckboxChange}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <label className="text-sm font-medium leading-6 cursor-pointer">
                          {addon.label}
                          {isRequired && (
                            <span className="ml-1 text-xs text-blue-600 font-medium">
                              *
                            </span>
                          )}
                        </label>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {addon.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* More coming soon placeholder */}
              <div className="relative flex items-start space-x-3 rounded-lg border border-dashed border-muted-foreground/50 p-4 opacity-60">
                <div className="flex items-center justify-center w-5 h-5 mt-1">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium leading-6 text-muted-foreground">
                      More coming soon...
                    </label>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Additional platform add-ons will be available in future
                    releases.
                  </p>
                </div>
              </div>
            </div>

            {field.state.meta.errors && (
              <p className="text-sm text-destructive">
                {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      </form.Field>

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
          onClick={onNext}
          className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
          disabled={isDeploying}
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleDeploy}
          className="px-6 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDeploying}
        >
          {isDeploying ? "Deploying..." : "Deploy Add-ons"}
        </button>
      </div>

      {/* Verification Modal */}
      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        title="Enter your PIN code to deploy add-ons"
        description="You're about to deploy platform add-ons to the blockchain. To authorize this action, we need you to confirm your identity."
        hasPincode={hasPincode}
        hasTwoFactor={hasTwoFactor}
        isLoading={isDeploying}
        loadingText="Deploying add-ons..."
        confirmText="Deploy Add-ons"
        errorMessage={verificationError}
        onPincodeSubmit={handlePincodeSubmit}
        onOtpSubmit={handleOtpSubmit}
      />
    </div>
  );
});
