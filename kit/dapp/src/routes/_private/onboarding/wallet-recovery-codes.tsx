import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const logger = createLogger();

export const Route = createFileRoute(
  "/_private/onboarding/wallet-recovery-codes"
)({
  beforeLoad: async ({ context: { orpc, queryClient } }) => {
    const user = await queryClient.fetchQuery({
      ...orpc.user.me.queryOptions(),
      staleTime: 0,
    });
    const { currentStep } = updateOnboardingStateMachine({ user });
    if (currentStep !== OnboardingStep.walletRecoveryCodes) {
      return redirect({
        to: `/onboarding/${currentStep}`,
      });
    }
    return { currentStep };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [isRevalidating, setIsRevalidating] = useState(false);
  const router = useRouter();

  const {
    mutate: generateRecoveryCodes,
    isPending: isGeneratingCodes,
    data: recoveryCodesData,
  } = useMutation({
    mutationFn: async () =>
      authClient.secretCodes.generate({
        password: undefined,
      }),

    onError: (error: Error) => {
      logger.error("generateRecoveryCodes error:", error);
      toast.error(error.message || "Failed to generate recovery codes");
    },
  });

  const recoveryCodes = useMemo(
    () => recoveryCodesData?.data?.secretCodes ?? [],
    [recoveryCodesData]
  );

  // Memoized functions to avoid creating new functions in render
  const handleCopyAll = useCallback(() => {
    void navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success("Recovery codes copied to clipboard!");
  }, [recoveryCodes]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([recoveryCodes.join("\n")], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recovery-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Recovery codes downloaded!");
  }, [recoveryCodes]);

  const handleCopyCode = useCallback((code: string, index: number) => {
    void navigator.clipboard.writeText(code);
    toast.success(`Code ${index + 1} copied!`);
  }, []);

  const onNext = useCallback(async () => {
    try {
      setIsRevalidating(true);
      await router.invalidate({ sync: true });
    } catch (err: unknown) {
      logger.error("Error invalidating queries", err);
    } finally {
      setIsRevalidating(false);
    }
  }, [router]);

  useEffect(() => {
    generateRecoveryCodes();
  }, [generateRecoveryCodes]);

  return (
    <OnboardingLayout currentStep={OnboardingStep.walletRecoveryCodes}>
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Your secret codes</h2>
          <p className="text-sm text-muted-foreground pt-2">
            Save these codes somewhere safe
          </p>
          <p className="text-sm pt-2">
            These codes can be used to recover your wallet if you forget your
            pin or lose access to your authenticator app.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl space-y-6">
            {/* Recovery Codes Display */}
            {isGeneratingCodes ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <svg
                  className="h-8 w-8 animate-spin text-muted-foreground"
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
                <p className="text-sm text-muted-foreground">
                  Generating your recovery codes...
                </p>
              </div>
            ) : recoveryCodes.length > 0 ? (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleCopyAll}
                    className="gap-2"
                  >
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy codes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="gap-2"
                  >
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download codes
                  </Button>
                </div>

                {/* Recovery Codes Grid */}
                <div className="bg-background border rounded-lg p-6">
                  <h4 className="text-sm font-medium mb-4 text-center">
                    Your Recovery Codes ({recoveryCodes.length})
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {recoveryCodes.map((code, index) => (
                      <RecoveryCodeItem
                        key={`${code}-${index}`}
                        code={code}
                        index={index}
                        onCopy={handleCopyCode}
                      />
                    ))}
                  </div>
                </div>

                {/* Warning Section */}
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
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                        Important: Keep these codes safe! they're your only way
                        to regain access if you lose other security methods.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <svg
                  className="h-8 w-8 text-muted-foreground"
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
                <p className="text-sm text-muted-foreground">
                  Failed to generate recovery codes
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex justify-end gap-3">
            <Button
              onClick={onNext}
              disabled={
                isGeneratingCodes ||
                recoveryCodes.length === 0 ||
                isRevalidating
              }
            >
              Confirm i've stored them
            </Button>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}

interface RecoveryCodeItemProps {
  code: string;
  index: number;
  onCopy: (code: string, index: number) => void;
}

function RecoveryCodeItem({ code, index, onCopy }: RecoveryCodeItemProps) {
  const handleCopy = useCallback(() => {
    onCopy(code, index);
  }, [code, index, onCopy]);

  return (
    <div className="relative group">
      <div className="flex items-center p-2 bg-muted rounded-lg border hover:bg-muted/80 transition-colors">
        <span className="text-xs text-muted-foreground w-8">
          {(index + 1).toString().padStart(2, "0")}.
        </span>
        <code className="font-mono text-sm select-all flex-1 text-center">
          {code}
        </code>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        onClick={handleCopy}
        title={`Copy code ${index + 1}`}
      >
        <svg
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </Button>
    </div>
  );
}
