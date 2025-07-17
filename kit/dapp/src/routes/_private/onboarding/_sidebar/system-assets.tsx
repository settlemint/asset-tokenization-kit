import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { orpc } from "@/orpc/orpc-client";
import { type TokenType } from "@/orpc/routes/token/routes/factory/factory.create.schema";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import {
  AlertCircle,
  BarChart3,
  Building,
  Coins,
  Loader2,
  PiggyBank,
  Wallet,
} from "lucide-react";

const logger = createLogger();

// Asset type configuration with icons and descriptions
const ASSET_TYPES = {
  bond: {
    icon: Building,
    title: "Bond",
    description: "Debt securities with fixed terms and interest payments",
  },
  equity: {
    icon: BarChart3,
    title: "Equity",
    description: "Company shares and stock ownership tokens",
  },
  fund: {
    icon: PiggyBank,
    title: "Fund",
    description: "Investment fund tokens and portfolio management",
  },
  stablecoin: {
    icon: Coins,
    title: "Stablecoin",
    description: "Fiat-pegged digital currencies for stable value",
  },
  deposit: {
    icon: Wallet,
    title: "Deposit",
    description: "Bank deposit tokenization and financial products",
  },
} as const;

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/system-assets"
)({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.fetchQuery({
      ...orpc.user.me.queryOptions(),
      staleTime: 0,
    });

    // Check if a system exists AND is fully bootstrapped
    let hasSystem = false;
    try {
      const [systemAddress, bootstrapComplete] = await Promise.all([
        queryClient.fetchQuery({
          ...orpc.settings.read.queryOptions({
            input: { key: "SYSTEM_ADDRESS" },
          }),
          staleTime: 0,
        }),
        queryClient.fetchQuery({
          ...orpc.settings.read.queryOptions({
            input: { key: "SYSTEM_BOOTSTRAP_COMPLETE" },
          }),
          staleTime: 0,
        }),
      ]);

      const hasSystemAddress = !!(systemAddress && systemAddress.trim() !== "");
      const isBootstrapComplete = bootstrapComplete === "true";
      hasSystem = hasSystemAddress && isBootstrapComplete;
    } catch {
      hasSystem = false;
    }

    const { currentStep } = updateOnboardingStateMachine({ user });

    // Allow navigation to system-assets if:
    // 1. User is not yet onboarded, OR
    // 2. Current step is systemAssets, OR
    // 3. Current step is any system step (systemDeploy, systemSettings, systemAssets, systemAddons)
    const allowedSystemSteps = [
      OnboardingStep.systemDeploy,
      OnboardingStep.systemSettings,
      OnboardingStep.systemAssets,
      OnboardingStep.systemAddons,
    ];

    if (user.isOnboarded && !allowedSystemSteps.includes(currentStep)) {
      return redirect({
        to: `/onboarding/${currentStep}`,
      });
    }
    return { currentStep, user, hasSystem };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAssets, setSelectedAssets] = useState<TokenType[]>([]);

  // Get system address for factory creation
  const { data: systemAddress } = useQuery({
    ...orpc.settings.read.queryOptions({
      input: { key: "SYSTEM_ADDRESS" },
    }),
    throwOnError: false,
  });

  // Get system details to access tokenFactoryRegistry
  const { data: systemDetails } = useQuery({
    ...orpc.system.read.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: !!systemAddress,
    throwOnError: false,
    retry: (failureCount, error) => {
      // Retry up to 3 times for 404 errors (TheGraph indexing delay)
      if (
        error instanceof Error &&
        error.message.includes("System not found")
      ) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fallback: Get tokenFactoryRegistry directly from Portal when TheGraph fails
  const { data: portalSystemData, error: portalError } = useQuery({
    ...orpc.system.portalRead.queryOptions({
      input: { id: systemAddress ?? "" },
    }),
    enabled: !!systemAddress,
    throwOnError: false,
    retry: (failureCount) => {
      logger.debug("Portal query retry attempt:", failureCount);
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  const portalTokenFactoryRegistry = portalSystemData?.tokenFactoryRegistry;

  // Factory creation streaming mutation
  const {
    mutate: createFactories,
    isTracking: isDeploying,
    latestMessage,
  } = useStreamingMutation({
    mutationOptions: orpc.token.factoryCreate.mutationOptions(),
    onSuccess: async () => {
      toast.success("Asset factories created successfully!");

      // Invalidate system queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: orpc.system.read.key(),
      });

      if (systemAddress) {
        await queryClient.invalidateQueries({
          queryKey: orpc.system.read.queryOptions({
            input: { id: systemAddress },
          }).queryKey,
        });
      }

      handleNext();
    },
  });

  const handleNext = useCallback(() => {
    void navigate({
      to: `/onboarding/${OnboardingStep.systemAddons}`,
    });
  }, [navigate]);

  const handlePrevious = useCallback(() => {
    void navigate({
      to: `/onboarding/${OnboardingStep.systemSettings}`,
    });
  }, [navigate]);

  const handleAssetToggle = useCallback((assetType: TokenType) => {
    logger.debug("Toggling asset:", assetType);
    setSelectedAssets((prev) => {
      logger.debug("Current selected assets:", prev);
      if (prev.includes(assetType)) {
        const newValue = prev.filter((type) => type !== assetType);
        logger.debug("Removing asset, new value:", newValue);
        return newValue;
      }
      const newValue = [...prev, assetType];
      logger.debug("Adding asset, new value:", newValue);
      return newValue;
    });
  }, []);

  // Use either TheGraph data or Portal fallback for tokenFactoryRegistry
  const tokenFactoryRegistry =
    systemDetails?.tokenFactoryRegistry ?? portalTokenFactoryRegistry;

  logger.debug("TokenFactoryRegistry resolution:", {
    fromTheGraph: systemDetails?.tokenFactoryRegistry,
    fromPortal: portalTokenFactoryRegistry,
    final: tokenFactoryRegistry,
    portalError: portalError?.message,
  });

  const handleDeployFactories = useCallback(() => {
    if (!systemAddress) {
      toast.error("System address not found");
      return;
    }

    if (!tokenFactoryRegistry) {
      toast.error(
        "Token Factory Registry not available yet. The system may still be initializing. Please wait a moment and try again."
      );
      return;
    }

    if (selectedAssets.length === 0) {
      toast.error("Please select at least one asset type");
      return;
    }

    const factories = selectedAssets.map((type) => ({
      type,
      name: `${ASSET_TYPES[type].title} Factory`,
    }));

    createFactories({
      contract: tokenFactoryRegistry,
      factories,
      verification: {
        verificationCode: "123456", // TODO: Implement proper verification dialog
        verificationType: "pincode",
      },
    });
  }, [systemAddress, tokenFactoryRegistry, selectedAssets, createFactories]);

  const isFormValid = selectedAssets.length > 0;

  logger.debug("Current form state:", {
    systemAddress,
    selectedAssets,
    isFormValid,
    isDeploying,
    systemDetails: systemDetails
      ? {
          tokenFactoryRegistry: systemDetails.tokenFactoryRegistry,
          hasTokenFactoryRegistry: !!systemDetails.tokenFactoryRegistry,
        }
      : null,
    portalTokenFactoryRegistry,
    portalError: portalError?.message,
    finalTokenFactoryRegistry: tokenFactoryRegistry,
    buttonDisabled: !isFormValid || isDeploying || !systemAddress,
  });

  return (
    <OnboardingLayout currentStep={OnboardingStep.systemAssets}>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Select Assets</h2>
          <p className="text-sm text-muted-foreground pt-2">
            Choose which asset types your platform will support
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl space-y-6">
            {/* Information box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900">Asset Factories</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Asset factories are smart contracts that create and manage
                    different types of tokens on your platform. Select the asset
                    types you want to support. You can add more later from the
                    admin panel.
                  </p>
                </div>
              </div>
            </div>

            {/* Asset selection grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(ASSET_TYPES).map(([key, config]) => {
                const assetType = key as TokenType;
                const isSelected = selectedAssets.includes(assetType);
                const Icon = config.icon;

                return (
                  <div
                    key={assetType}
                    className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      logger.debug("Card clicked for asset:", assetType);
                      handleAssetToggle(assetType);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <Icon
                          className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">
                            {config.title}
                          </h3>
                          <div className="ml-auto">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                logger.debug(
                                  "Checkbox changed for asset:",
                                  assetType,
                                  "checked:",
                                  e.target.checked
                                );
                                e.stopPropagation();
                                handleAssetToggle(assetType);
                              }}
                              className="w-4 h-4 rounded border border-input accent-primary"
                            />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Deployment progress */}
            {isDeploying && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                  <div>
                    <h3 className="font-medium text-yellow-900">
                      Deploying Factories
                    </h3>
                    <p className="text-sm text-yellow-800 mt-1">
                      {latestMessage ??
                        "Creating asset factories... This may take a few minutes."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation error */}
            {selectedAssets.length === 0 && (
              <div className="text-sm text-destructive">
                Please select at least one asset type to continue.
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isDeploying}
            >
              Previous
            </Button>
            <Button
              type="button"
              onClick={handleDeployFactories}
              disabled={!isFormValid || isDeploying || !systemAddress}
              className="min-w-[120px]"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                "Deploy & Continue"
              )}
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
