import { Button } from "@/components/ui/button";
import { VerificationDialog } from "@/components/ui/verification-dialog";
import { useSettings } from "@/hooks/use-settings";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { orpc } from "@/orpc/orpc-client";
import type { CurrentUser } from "@/orpc/routes/user/routes/user.me.schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DeploymentDetails } from "./deployment-details";
import { DeploymentProgress } from "./deployment-progress";

interface SystemBootstrapMainProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  user?: CurrentUser;
}

export function SystemBootstrapMain({
  onNext,
  onPrevious,
  isFirstStep,
}: SystemBootstrapMainProps) {
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");
  const queryClient = useQueryClient();

  // Modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [showDeploymentProgress, setShowDeploymentProgress] = useState(false);
  const [deploymentFailed, setDeploymentFailed] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // For system deployment, we'll use PIN code verification by default
  const hasTwoFactor = false;
  const hasPincode = true;

  // System deployment mutation
  const {
    mutate: createSystemMutation,
    isPending: isCreatingSystem,
    isTracking,
    error,
    latestMessage,
  } = useStreamingMutation({
    mutationOptions: orpc.system.create.mutationOptions(),
    onSuccess: async () => {
      // Refetch system address
      await queryClient.refetchQueries({
        queryKey: orpc.settings.read.key({
          input: { key: "SYSTEM_ADDRESS" },
        }),
      });

      // Refetch user data to update onboarding state
      await queryClient.refetchQueries({
        queryKey: orpc.user.me.key(),
      });

      setShowDeploymentProgress(false);
      setDeploymentFailed(false);
      setIsBootstrapped(true);
    },
  });

  // Fetch real system details when system address is available
  // Only enable this query when showing the success screen (system already exists)
  // This avoids authentication issues during active deployment
  // It's normal for this to fail initially if TheGraph hasn't indexed the system yet
  const { data: realSystemDetails } = useQuery({
    ...orpc.system.read.queryOptions({ input: { id: systemAddress ?? "" } }),
    enabled: !!systemAddress && !showDeploymentProgress && !isCreatingSystem,
    retry: 3,
    retryDelay: 1000,
    // Silently handle errors as TheGraph may not have indexed the system yet
    throwOnError: false,
  });

  // Monitor for indexing errors
  const errorMessage = error?.message ?? "";
  const currentMessage = latestMessage ?? "";
  const isIndexingError =
    errorMessage.includes("indexing") ||
    errorMessage.includes("Indexing timeout") ||
    currentMessage.includes("Waiting for indexing");

  // Set deployment failed when we get indexing errors
  useEffect(() => {
    if (error && isIndexingError) {
      setDeploymentFailed(true);
    }
  }, [error, isIndexingError]);

  // Wrapper function to handle errors
  const createSystem = useCallback(
    (params: Parameters<typeof createSystemMutation>[0]) => {
      try {
        // Close the verification modal immediately
        setShowVerificationModal(false);
        setVerificationError(null);
        setDeploymentFailed(false);

        // Show deployment progress screen
        setShowDeploymentProgress(true);

        createSystemMutation(params);
      } catch (error) {
        // Hide deployment progress on error
        setShowDeploymentProgress(false);
        setDeploymentFailed(true);

        // Reopen the verification modal on error for retry
        setShowVerificationModal(true);

        // Check if it's a system creation error
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        if (
          errorMessage.includes("System creation failed") ||
          errorMessage.includes("INTERNAL_SERVER_ERROR")
        ) {
          setVerificationError("System creation failed");
        } else if (errorMessage.includes("verification")) {
          setVerificationError("Incorrect PIN code. Please try again.");
        } else {
          setVerificationError("An error occurred. Please try again.");
        }
      }
    },
    [createSystemMutation]
  );

  const isDeploying = isCreatingSystem || isTracking;
  const hasSystem = !!systemAddress && systemAddress.trim() !== "";

  // Show success screen if system was just bootstrapped or already exists
  const showSuccessScreen = isBootstrapped || hasSystem;

  // Determine which screen to show
  const currentScreen = showDeploymentProgress
    ? deploymentFailed
      ? "failed"
      : "progress"
    : showSuccessScreen
      ? "success"
      : "initial";

  const handleDeploySystem = useCallback(() => {
    if (!hasSystem && !isDeploying) {
      setVerificationError(null);
      setShowVerificationModal(true);
    }
  }, [hasSystem, isDeploying]);

  const handlePrevious = useCallback(() => {
    onPrevious?.();
  }, [onPrevious]);

  // Handle form submissions
  const handlePincodeSubmit = useCallback(
    (pincode: string) => {
      setVerificationError(null);
      createSystem({
        verification: {
          verificationCode: pincode,
          verificationType: "pincode",
        },
        messages: {
          streamTimeout: "Transaction stream timeout",
          waitingForMining: "Waiting for transaction to be mined...",
          transactionFailed: "Transaction failed",
          transactionDropped: "Transaction was dropped",
          waitingForIndexing: "Waiting for indexing...",
          transactionIndexed: "Transaction indexed successfully",
          indexingTimeout: "Indexing timeout",
          systemCreated: "System created successfully",
          creatingSystem: "Creating system...",
          systemCreationFailed: "System creation failed",
          bootstrappingSystem: "Bootstrapping system...",
          bootstrapFailed: "Bootstrap failed",
          systemCreatedBootstrapFailed: "System created but bootstrap failed",
          initialLoading: "Loading...",
          noResultError: "No result received",
          defaultError: "An error occurred",
        },
      });
    },
    [createSystem]
  );

  const handleOtpSubmit = useCallback(
    (otp: string) => {
      setVerificationError(null);
      createSystem({
        verification: {
          verificationCode: otp,
          verificationType: "two-factor",
        },
        messages: {
          streamTimeout: "Transaction stream timeout",
          waitingForMining: "Waiting for transaction to be mined...",
          transactionFailed: "Transaction failed",
          transactionDropped: "Transaction was dropped",
          waitingForIndexing: "Waiting for indexing...",
          transactionIndexed: "Transaction indexed successfully",
          indexingTimeout: "Indexing timeout",
          systemCreated: "System created successfully",
          creatingSystem: "Creating system...",
          systemCreationFailed: "System creation failed",
          bootstrappingSystem: "Bootstrapping system...",
          bootstrapFailed: "Bootstrap failed",
          systemCreatedBootstrapFailed: "System created but bootstrap failed",
          initialLoading: "Loading...",
          noResultError: "No result received",
          defaultError: "An error occurred",
        },
      });
    },
    [createSystem]
  );

  const handleDeploymentComplete = useCallback(() => {
    setIsBootstrapped(true);
  }, []);

  const handleRetryDeployment = useCallback(() => {
    setDeploymentFailed(false);
    setShowDeploymentProgress(false);
    setVerificationError(null);
    setShowVerificationModal(true);
  }, []);

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            {currentScreen === "progress"
              ? "Deploying the system"
              : currentScreen === "success"
                ? "System deployed successfully"
                : currentScreen === "failed"
                  ? "System deployment failed"
                  : "Initialize the system"}
          </h2>
          <p className="text-sm text-muted-foreground pt-2">
            {currentScreen === "progress"
              ? "We're setting up your platform by deploying the necessary smart contracts. This includes the Identity Registry, Compliance Engine, and Trusted Issuers Registry."
              : currentScreen === "success"
                ? "You are now the initial administrator of the platform."
                : currentScreen === "failed"
                  ? "The system deployment encountered an error. This is usually due to network connectivity issues or indexing delays. Please try again."
                  : "You're about to set up the foundation of the platform"}
          </p>
          {currentScreen === "progress" && (
            <p className="text-sm text-muted-foreground pt-2">
              This process may take 2–3 minutes. Please keep this tab open and
              stay connected to the internet.
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {currentScreen === "progress" ? (
            <DeploymentProgress
              onComplete={handleDeploymentComplete}
              currentMessage={latestMessage}
              hasError={!!error}
              onRetry={handleRetryDeployment}
            />
          ) : currentScreen === "failed" ? (
            /* Failed Screen */
            <div className="max-w-3xl space-y-6 text-center">
              {/* Red Error Box */}
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center space-y-2">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Deployment failed
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  The system deployment encountered an error, likely due to
                  network connectivity issues or indexing delays.
                </p>
                <div className="flex items-center justify-center pt-2">
                  <TriangleAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What happened?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground text-left">
                  <li>
                    • The transaction may have been mined but indexing is taking
                    longer than expected
                  </li>
                  <li>
                    • Network connectivity issues may have interrupted the
                    process
                  </li>
                  <li>
                    • TheGraph indexing service may be temporarily unavailable
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Don't worry - this is usually temporary. Click "Retry
                  Deployment" to try again.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                {!isFirstStep && (
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
                <Button onClick={handleRetryDeployment} className="flex-1">
                  Retry Deployment
                </Button>
              </div>
            </div>
          ) : currentScreen === "success" ? (
            /* Success Screen */
            <div className="max-w-3xl space-y-6 text-center">
              {/* Green Success Box */}
              <div className="rounded-lg bg-sm-state-success-background/50 border border-sm-state-success-background p-4 text-center space-y-2">
                <h3 className="text-lg font-semibold text-sm-state-success">
                  System deployed successfully
                </h3>
                <p className="text-sm text-sm-state-success">
                  The smart contracts powering your platform are now live on the
                  blockchain.
                </p>
                <div className="flex items-center justify-center pt-2">
                  <CheckCircle className="w-6 h-6 text-sm-state-success" />
                </div>
              </div>

              <DeploymentDetails
                systemAddress={systemAddress}
                systemDetails={realSystemDetails}
              />

              <div className="flex gap-3 pt-4">
                {!isFirstStep && (
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
                <Button onClick={() => onNext?.()} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            /* Initial Screen */
            <div className="max-w-2xl space-y-6">
              <div className="rounded-lg bg-sm-state-warning-background/50 border border-sm-state-warning-background p-4">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="h-5 w-5 text-sm-state-warning mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-sm-state-warning">
                      This action will deploy blockchain smart contracts and
                      cannot be undone. Once deployed, the system will be
                      permanently active on the blockchain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What gets deployed:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Core system smart contract</li>
                  <li>• Identity Registry for user verification</li>
                  <li>• Compliance Engine for regulatory requirements</li>
                  <li>• Trusted Issuers Registry for authorized parties</li>
                  <li>• Token Factory Registry for asset creation</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                {!isFirstStep && (
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                )}
                <Button
                  onClick={handleDeploySystem}
                  disabled={isDeploying}
                  className="flex-1"
                >
                  {isDeploying ? "Deploying..." : "Deploy System"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        hasTwoFactor={hasTwoFactor}
        hasPincode={hasPincode}
        onPincodeSubmit={handlePincodeSubmit}
        onOtpSubmit={handleOtpSubmit}
        isLoading={isDeploying}
        title="Confirm System Deployment"
        description="Please verify your identity to deploy the blockchain system."
        errorMessage={verificationError}
      />
    </>
  );
}
