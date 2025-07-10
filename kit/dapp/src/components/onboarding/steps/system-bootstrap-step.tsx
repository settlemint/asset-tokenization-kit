import { Button } from "@/components/ui/button";
import { VerificationDialog } from "@/components/ui/verification-dialog";
import { authClient } from "@/lib/auth/auth.client";
import type { SessionUser } from "@/lib/auth";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { useSettings } from "@/hooks/use-settings";
import { queryClient } from "@/lib/query.client";
import { orpc } from "@/orpc";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface SystemBootstrapStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  user?: SessionUser;
}

export function SystemBootstrapStep({
  onNext,
  onPrevious,
  isFirstStep,
  user,
}: SystemBootstrapStepProps) {
  const { data: session } = authClient.useSession();
  const [systemAddress] = useSettings("SYSTEM_ADDRESS");

  // Modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [showDeploymentDetails, setShowDeploymentDetails] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // Check if user has 2FA enabled to determine available verification methods
  const currentUser = user ?? session?.user;
  const hasTwoFactor = currentUser?.twoFactorEnabled || false;
  const hasPincode = currentUser?.pincodeEnabled || false;

  // Fetch real system details when system address is available
  const { data: realSystemDetails } = useQuery({
    ...orpc.system.read.queryOptions({ input: { id: systemAddress! } }),
    enabled: !!systemAddress,
  });

  // System deployment mutation
  const {
    mutate: createSystemMutation,
    isPending: isCreatingSystem,
    isTracking,
  } = useStreamingMutation({
    mutationOptions: orpc.system.create.mutationOptions(),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: orpc.settings.read.key({
          input: { key: "SYSTEM_ADDRESS" },
        }),
      });
      setShowVerificationModal(false);
      setVerificationError(null);
      setIsBootstrapped(true);
      onNext?.();
    },
  });

  // Wrapper function to handle errors
  const createSystem = useCallback(
    async (params: Parameters<typeof createSystemMutation>[0]) => {
      try {
        await createSystemMutation(params);
      } catch (error) {
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
        // Don't close the modal on error - keep it open for retry
      }
    },
    [createSystemMutation]
  );

  const isDeploying = isCreatingSystem || isTracking;
  const hasSystem = !!systemAddress && systemAddress.trim() !== "";

  // Show success screen if system was just bootstrapped or already exists
  const showSuccessScreen = isBootstrapped || hasSystem;

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
      setVerificationError(null); // Clear any previous errors
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
      setVerificationError(null); // Clear any previous errors
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

  // Copy functions for deployment details
  const handleCopyAddress = useCallback((address: string, label: string) => {
    void navigator.clipboard.writeText(address);
    toast.success(`${label} address copied to clipboard!`);
  }, []);

  return (
    <>
      <div className="h-full flex flex-col">
        <style>{`
          @keyframes draw {
            to {
              stroke-dashoffset: 0;
            }
          }
        `}</style>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            {showSuccessScreen
              ? "System deployed successfully"
              : "Initialize the system"}
          </h2>
          <p className="text-sm text-muted-foreground pt-2">
            {showSuccessScreen
              ? "You are now the initial administrator of the platform."
              : "You're about to set up the foundation of the platform"}
          </p>
          {showSuccessScreen && (
            <div className="pt-4">
              <p className="text-sm mb-3">From here, you'll be able to:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>Configure supported assets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>Invite additional admins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>Manage compliance and identity modules</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {showSuccessScreen ? (
            /* Success Screen */
            <div className="max-w-3xl space-y-6 text-center">
              {/* Green Success Box */}
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center space-y-2">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                  System deployed successfully
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  The smart contracts powering your platform are now live on the
                  blockchain.
                </p>
              </div>

              <div className="space-y-4">
                {/* Single Column Layout */}
                <div className="text-left">
                  <button
                    onClick={() =>
                      setShowDeploymentDetails(!showDeploymentDetails)
                    }
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        showDeploymentDetails ? "rotate-90" : "rotate-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    View Deployment Details
                  </button>

                  {showDeploymentDetails && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex-shrink-0">System Contract:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs flex-1 min-w-0 truncate">
                          {realSystemDetails?.id ||
                            systemAddress ||
                            "Not deployed"}
                        </code>
                        <button
                          onClick={() =>
                            handleCopyAddress(
                              realSystemDetails?.id || systemAddress || "",
                              "System Contract"
                            )
                          }
                          className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
                          title="Copy to clipboard"
                          disabled={!realSystemDetails?.id && !systemAddress}
                        >
                          <svg
                            className="w-3 h-3 text-muted-foreground hover:text-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                      </div>
                      {realSystemDetails?.identityRegistry && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">
                            Identity Registry:
                          </span>
                          <code className="bg-muted px-2 py-1 rounded text-xs flex-1 min-w-0 truncate">
                            {realSystemDetails.identityRegistry}
                          </code>
                          <button
                            onClick={() =>
                              handleCopyAddress(
                                realSystemDetails.identityRegistry!,
                                "Identity Registry"
                              )
                            }
                            className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg
                              className="w-3 h-3 text-muted-foreground hover:text-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      {realSystemDetails?.compliance && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">
                            Compliance Engine:
                          </span>
                          <code className="bg-muted px-2 py-1 rounded text-xs flex-1 min-w-0 truncate">
                            {realSystemDetails.compliance}
                          </code>
                          <button
                            onClick={() =>
                              handleCopyAddress(
                                realSystemDetails.compliance!,
                                "Compliance Engine"
                              )
                            }
                            className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg
                              className="w-3 h-3 text-muted-foreground hover:text-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      {realSystemDetails?.trustedIssuersRegistry && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">
                            Trusted Issuers Registry:
                          </span>
                          <code className="bg-muted px-2 py-1 rounded text-xs flex-1 min-w-0 truncate">
                            {realSystemDetails.trustedIssuersRegistry}
                          </code>
                          <button
                            onClick={() =>
                              handleCopyAddress(
                                realSystemDetails.trustedIssuersRegistry!,
                                "Trusted Issuers Registry"
                              )
                            }
                            className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg
                              className="w-3 h-3 text-muted-foreground hover:text-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      {realSystemDetails?.tokenFactoryRegistry && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">
                            Token Factory Registry:
                          </span>
                          <code className="bg-muted px-2 py-1 rounded text-xs flex-1 min-w-0 truncate">
                            {realSystemDetails.tokenFactoryRegistry}
                          </code>
                          <button
                            onClick={() =>
                              handleCopyAddress(
                                realSystemDetails.tokenFactoryRegistry!,
                                "Token Factory Registry"
                              )
                            }
                            className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg
                              className="w-3 h-3 text-muted-foreground hover:text-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      {realSystemDetails?.deployedInTransaction && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex-shrink-0">
                            Deployment transaction:
                          </span>
                          <code className="bg-muted px-2 py-1 rounded text-xs flex-1 min-w-0 truncate">
                            {realSystemDetails.deployedInTransaction}
                          </code>
                          <button
                            onClick={() =>
                              handleCopyAddress(
                                realSystemDetails.deployedInTransaction!,
                                "Deployment transaction"
                              )
                            }
                            className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <svg
                              className="w-3 h-3 text-muted-foreground hover:text-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      )}
                      {realSystemDetails?.tokenFactories &&
                        realSystemDetails.tokenFactories.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground pt-2">
                              Token Factories:
                            </div>
                            {realSystemDetails.tokenFactories.map((factory) => (
                              <div
                                key={factory.id}
                                className="flex items-center gap-2 min-w-0 pl-2"
                              >
                                <span className="flex-shrink-0 text-xs">
                                  {factory.name}:
                                </span>
                                <code className="bg-muted px-2 py-1 rounded text-xs flex-1 min-w-0 truncate">
                                  {factory.id}
                                </code>
                                <button
                                  onClick={() =>
                                    handleCopyAddress(factory.id, factory.name)
                                  }
                                  className="flex-shrink-0 p-1 hover:bg-muted/50 rounded transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <svg
                                    className="w-3 h-3 text-muted-foreground hover:text-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Initial Setup Screen */
            <div className="max-w-3xl space-y-6">
              <div>
                <p className="text-sm leading-relaxed">
                  As the first user, you're responsible for bootstrapping the
                  system — a one-time setup that deploys the core smart
                  contracts powering the platform.
                </p>
              </div>

              <div>
                <p className="text-sm leading-relaxed">
                  By doing this, you'll become the initial administrator of the
                  system and gain full control over its foundational components.
                  Later, you'll be able to invite additional admins to help
                  manage operations.
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-3">
                  Bootstrapping the system includes deploying these critical
                  smart contracts:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>
                      <strong>Identity Registry</strong> – manages user
                      identities on-chain
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>
                      <strong>Compliance Engine</strong> – enforces rules like
                      KYC, jurisdiction, and transfer restrictions
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>
                      <strong>Trusted Issuers Registry</strong> – defines which
                      entities can issue verified credentials
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-sm leading-relaxed">
                  These smart contracts form the secure infrastructure behind
                  user identity, compliance, and asset issuance. Once deployed,
                  your platform will be ready to support real-world
                  tokenization.
                </p>
              </div>

              {/* Warning Message */}
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      <strong>Note:</strong> This step may take 2–3 minutes as
                      the system deploys smart contracts on-chain. Please keep
                      this tab open and don't refresh.
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Message */}
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
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      You'll be asked to enter your PIN or OTP to unlock your
                      wallet and authorize this blockchain action.
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      We'll ask for this anytime you need to sign a transaction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-end gap-3">
            {!isFirstStep && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button
              onClick={hasSystem ? onNext : handleDeploySystem}
              disabled={isDeploying}
            >
              {showSuccessScreen
                ? "Configure platform settings"
                : "Deploy the system"}
            </Button>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationDialog
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        title="Enter your PIN code to continue deployment"
        description="You're about to deploy the core system using your wallet. To authorize this critical action, we need you to confirm your identity."
        hasPincode={hasPincode}
        hasTwoFactor={hasTwoFactor}
        isLoading={isDeploying}
        loadingText="Deploying..."
        confirmText="Deploy System"
        errorMessage={verificationError}
        onPincodeSubmit={handlePincodeSubmit}
        onOtpSubmit={handleOtpSubmit}
      />
    </>
  );
}
