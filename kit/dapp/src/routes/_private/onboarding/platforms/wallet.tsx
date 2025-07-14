import { OnboardingLayout } from "@/components/onboarding/simplified/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/simplified/state-machine";
import { Button } from "@/components/ui/button";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const logger = createLogger();

export const Route = createFileRoute("/_private/onboarding/platforms/wallet")({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.fetchQuery({
      ...orpc.user.me.queryOptions(),
      staleTime: 0,
    });
    const { currentStep } = updateOnboardingStateMachine({ user });
    // Allow the wallet step to be shown if the user is not onboarded yet
    // As the wallet is created immediately, we should be less strict here
    if (user.isOnboarded && currentStep !== OnboardingStep.wallet) {
      return redirect({
        to: `/onboarding/platforms/${currentStep}`,
      });
    }
    return { currentStep, user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const { user } = Route.useRouteContext();

  const [walletCreationProgress, setWalletCreationProgress] = useState(0);
  // Always start with wallet creation flow to show educational content
  const [walletCreated, setWalletCreated] = useState(false);
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

  const handleNext = useCallback(() => {
    if (!isCreating && !walletCreated) {
      void handleStartCreation();
    } else if (walletCreated) {
      navigate({
        to: `/onboarding/platforms/${OnboardingStep.walletSecurity}`,
      }).catch((err: unknown) => {
        logger.error("Error navigating to wallet security", err);
      });
    }
  }, [isCreating, walletCreated, navigate]);

  const handleCopyWallet = useCallback(() => {
    if (user?.wallet) {
      void navigator.clipboard.writeText(user.wallet);
      toast.success("Wallet address copied to clipboard!");
    }
  }, [user?.wallet]);

  return (
    <OnboardingLayout currentStep={OnboardingStep.wallet}>
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
                : "Your Wallet"}
          </h2>
          <p className="text-sm text-muted-foreground pt-2">
            {walletCreated
              ? "Your secure wallet has been created successfully"
              : isCreating
                ? "Generating secure cryptographic keys..."
                : "Your Digital Key to the Blockchain"}
          </p>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={useMemo(
            () => ({ minHeight: "450px", maxHeight: "550px" }),
            []
          )}
        >
          <div className="max-w-3xl space-y-6 pr-2">
            {/* Main wallet explanation - only show when not creating/created */}
            {!isCreating && !walletCreated && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Your Digital Key to the Blockchain
                    </h3>
                    <p className="text-base text-foreground leading-relaxed">
                      Think of your wallet as your master key that unlocks all
                      your digital assets and identity on the blockchain. It's a
                      secure set of cryptographic codes that proves you own your
                      tokens and allows you to authorize transactions.
                    </p>
                  </div>

                  <div className="space-y-5">
                    <h4 className="text-base font-semibold text-foreground">
                      What your wallet enables:
                    </h4>

                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-foreground mb-1">
                            Asset Control
                          </h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            View, manage, and interact with tokenized assets on
                            the Asset Tokenization Kit platform. Your wallet
                            gives you complete control over your digital assets.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-foreground mb-1">
                            Transaction Authorization
                          </h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Securely authorize every transaction – from trading
                            tokens to registering your ONCHAINID – with your
                            digital signature.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-foreground mb-1">
                            Identity Management
                          </h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            Your wallet forms the foundation for your unique
                            ONCHAINID, linking your verified identity to all
                            blockchain activities.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

                {/* Educational text */}
                <div className="space-y-4 mb-6">
                  <p className="text-base text-foreground leading-relaxed">
                    Your wallet is being created...
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We're generating secure cryptographic keys that will serve
                    as your unique digital identity on the blockchain. This
                    process creates a mathematical pair of keys - one private
                    (kept secret) and one public (shareable) - that enables you
                    to securely interact with digital assets and verify your
                    identity.
                  </p>
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
              <div className="space-y-6">
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

                  <div className="space-y-2">
                    <p className="text-base text-muted-foreground">
                      Congratulations! Your Web3 wallet has been successfully
                      created
                    </p>
                  </div>
                </div>

                {/* Wallet Address Display */}
                {user?.wallet && (
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-foreground">
                      This is your wallet address
                    </h3>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-base font-mono text-green-800 dark:text-green-200 break-all">
                          {user.wallet}
                        </p>
                        <button
                          onClick={handleCopyWallet}
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
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    This address is something you can safely share with others
                    for them to send assets (like tokens or cryptocurrencies)
                    directly to your wallet. While all transactions to and from
                    this address are publicly recorded on the blockchain, your
                    personal identity remains private. Think of it like an email
                    address or a bank account number.
                  </p>

                  <p className="text-sm text-foreground leading-relaxed">
                    Because your wallet controls access to your valuable digital
                    assets and identity, it's important to keep it safe from
                    unauthorized access and ensure you can recover it if needed.
                  </p>

                  <p className="text-sm text-foreground leading-relaxed">
                    To protect you, next you'll set up a PIN, enable one-time
                    passwords (OTP), and create backup codes — simple security
                    steps that keep your wallet secure and recoverable.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-end gap-3">
            <Button onClick={handleNext} disabled={isCreating}>
              {isCreating ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                  >
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
                "Secure my wallet"
              ) : (
                "Create my wallet"
              )}
            </Button>
          </div>
        </div>
      </div>
      );
    </OnboardingLayout>
  );
}
