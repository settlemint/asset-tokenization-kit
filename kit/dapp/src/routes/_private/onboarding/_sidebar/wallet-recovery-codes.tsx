import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { orpc } from "@/orpc/orpc-client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { z } from "zod";

const logger = createLogger();

// TODO: extract the different html parts in separate components
// TODO: remove any inline SVG's, use lucide icons
// TODO: Use the copy component, no inline custom code
// TODO: Find (or worst case make) a useDownload hook
// TODO: Translations
export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/wallet-recovery-codes"
)({
  validateSearch: zodValidator(
    z.object({
      step: z.enum(Object.values(OnboardingStep)).optional(),
      subStep: z.enum(["intro", "complete"]).optional(),
    })
  ),
  beforeLoad: async ({
    context: { orpc, queryClient },
    search: { step, subStep },
  }) => {
    const user = await queryClient.ensureQueryData(orpc.user.me.queryOptions());
    const { currentStep } = updateOnboardingStateMachine({ user });

    // If we're showing the complete subStep, don't redirect
    if (subStep === "complete") {
      return;
    }

    if (step) {
      if (step !== OnboardingStep.walletRecoveryCodes) {
        return redirect({
          to: `/onboarding/${step}`,
        });
      }
    } else {
      if (currentStep !== OnboardingStep.walletRecoveryCodes) {
        return redirect({
          to: `/onboarding/${currentStep}`,
        });
      }
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate({ from: Route.fullPath });
  const { subStep } = Route.useSearch();

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
    await queryClient.invalidateQueries({
      queryKey: orpc.user.me.key(),
      refetchType: "all",
    });
    await navigate({
      search: () => ({
        step: OnboardingStep.walletRecoveryCodes,
        subStep: "complete",
      }),
    });
  }, [queryClient, navigate]);

  useEffect(() => {
    generateRecoveryCodes();
  }, [generateRecoveryCodes]);

  if (subStep === "complete") {
    return (
      <div>
        <div className="h-full flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Recovery Codes Saved</h2>
            <p className="text-sm text-muted-foreground pt-2">
              Your recovery codes have been generated and saved
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl space-y-6 pr-2">
              <div className="space-y-4">
                <p className="text-base text-foreground leading-relaxed">
                  Great! You've successfully saved your recovery codes. Keep
                  them in a safe place - you'll need them if you ever lose
                  access to your security methods.
                </p>
              </div>
            </div>
          </div>
        </div>
        <footer>
          <Button
            onClick={async () => {
              await navigate({
                to: `/onboarding/${OnboardingStep.systemDeploy}`,
              });
            }}
          >
            Continue
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <div>
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
      </div>
      <footer>
        <Button
          onClick={onNext}
          disabled={isGeneratingCodes || recoveryCodes.length === 0}
        >
          Confirm i've stored them
        </Button>
      </footer>
    </div>
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
