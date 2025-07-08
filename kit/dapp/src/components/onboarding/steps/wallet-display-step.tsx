import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import type { StepComponentProps } from "@/components/multistep-form/types";
import { toast } from "sonner";

interface WalletDisplayStepProps extends StepComponentProps {
  user?: any; // Use any for now to match the user type from session
}

export function WalletDisplayStep({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
  user,
}: WalletDisplayStepProps) {
  const [walletCreationProgress, setWalletCreationProgress] = useState(0);
  // Check if wallet already exists to determine if it was created
  const [walletCreated, setWalletCreated] = useState(Boolean(user?.wallet));
  const [isCreating, setIsCreating] = useState(false);

  const handleStartCreation = async () => {
    setIsCreating(true);

    // Simulate wallet creation with progress
    const duration = 2000; // 2 seconds
    const steps = 20;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, stepDuration));
      setWalletCreationProgress((i / steps) * 100);
    }

    setWalletCreated(true);
    setIsCreating(false);
  };

  const handleNext = () => {
    if (!isCreating && !walletCreated) {
      void handleStartCreation();
    } else if (walletCreated) {
      onNext();
    }
  };

  return (
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
          {walletCreated
            ? "Your Wallet is Ready!"
            : isCreating
              ? "Creating Your Wallet"
              : "Create Your Wallet"}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {walletCreated
            ? "Your secure wallet has been created successfully"
            : isCreating
              ? "Generating secure cryptographic keys..."
              : "Generate a secure wallet for all blockchain operations"}
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={useMemo(() => ({ minHeight: "450px", maxHeight: "550px" }), [])}
      >
        <div className="max-w-3xl space-y-6 pr-2">
          {/* Always show wallet info */}
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
                    What is a wallet?
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    A secure digital identity that allows you to interact with
                    the blockchain and manage your tokenized assets.
                  </p>
                </div>
              </div>
            </div>

            {/* Key features */}
            <div className="flex justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Instant</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <span>Protected</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Global</span>
              </div>
            </div>
          </div>

          {/* Show progress animation when creating */}
          {isCreating && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <svg
                    className="w-8 h-8 text-primary animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${walletCreationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round(walletCreationProgress)}% Complete
                </p>
              </div>
            </div>
          )}

          {/* Show wallet created success when completed */}
          {walletCreated && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
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
                        className="animate-[draw_0.8s_ease-out_forwards]"
                        style={{
                          strokeDasharray: "20",
                          strokeDashoffset: "20",
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Wallet Address Display */}
              {user?.wallet && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3 text-center">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Wallet Address
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-base font-mono text-green-800 dark:text-green-200 break-all">
                      {user.wallet}
                    </p>
                    <button
                      onClick={() => {
                        void navigator.clipboard.writeText(user.wallet);
                        toast.success("Wallet address copied to clipboard!");
                      }}
                      className="flex-shrink-0 p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg
                        className="w-4 h-4 text-green-600 dark:text-green-400"
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={isCreating}
            >
              Previous
            </Button>
          )}
          <Button onClick={handleNext} disabled={isCreating}>
            {isCreating ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : walletCreated ? (
              isLastStep ? (
                "Complete"
              ) : (
                "Secure your wallet..."
              )
            ) : (
              "Create Wallet"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}