import { Button } from "@/components/ui/button";
import type { SessionUser } from "@/lib/auth";
import { useCallback, useState } from "react";

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
}: SystemBootstrapStepProps) {
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  const handleNext = useCallback(() => {
    if (isBootstrapped) {
      onNext?.();
    } else {
      setIsBootstrapped(true);
      setTimeout(() => {
        onNext?.();
      }, 1000);
    }
  }, [isBootstrapped, onNext]);

  const handlePrevious = useCallback(() => {
    onPrevious?.();
  }, [onPrevious]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Initialize the system</h2>
        <p className="text-sm text-muted-foreground pt-2">
          You're about to set up the foundation of the platform
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl space-y-6">
          <div>
            <p className="text-sm leading-relaxed">
              As the first user, you're responsible for bootstrapping the system
              — a one-time setup that deploys the core smart contracts powering
              the platform.
            </p>
          </div>

          <div>
            <p className="text-sm leading-relaxed">
              By doing this, you'll become the initial administrator of the
              system and gain full control over its foundational components.
              Later, you'll be able to invite additional admins to help manage
              operations.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">
              Bootstrapping the system includes deploying these critical smart
              contracts:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>
                  <strong>Identity Registry</strong> – manages user identities
                  on-chain
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>
                  <strong>Compliance Engine</strong> – enforces rules like KYC,
                  jurisdiction, and transfer restrictions
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
              These smart contracts form the secure infrastructure behind user
              identity, compliance, and asset issuance. Once deployed, your
              platform will be ready to support real-world tokenization.
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
                  <strong>Note:</strong> This step may take 2–3 minutes as the
                  system deploys smart contracts on-chain. Please keep this tab
                  open and don't refresh.
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
                  You'll be asked to enter your PIN or OTP to unlock your wallet
                  and authorize this blockchain action.
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  We'll ask for this anytime you need to sign a transaction.
                </p>
              </div>
            </div>
          </div>

          {isBootstrapped && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-center">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                System Bootstrapped Successfully
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          <Button onClick={handleNext}>
            {isBootstrapped ? "Select Assets" : "Deploy the system"}
          </Button>
        </div>
      </div>
    </div>
  );
}
