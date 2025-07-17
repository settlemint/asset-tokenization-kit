import {
  OnboardingStep,
  updateOnboardingStateMachine,
} from "@/components/onboarding/state-machine";
import { RecoveryCodesActions } from "@/components/onboarding/wallet-security/recovery-codes-actions";
import { RecoveryCodesComplete } from "@/components/onboarding/wallet-security/recovery-codes-complete";
import { RecoveryCodesDisplay } from "@/components/onboarding/wallet-security/recovery-codes-display";
import { RecoveryCodesWarning } from "@/components/onboarding/wallet-security/recovery-codes-warning";
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
        throw redirect({
          to: `/onboarding/${step}`,
        });
      }
    } else {
      if (currentStep !== OnboardingStep.walletRecoveryCodes) {
        throw redirect({
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
    await queryClient.refetchQueries({
      queryKey: orpc.user.me.key(),
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
    return <RecoveryCodesComplete />;
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
            {recoveryCodes.length > 0 && (
              <>
                <RecoveryCodesActions
                  onCopyAll={handleCopyAll}
                  onDownload={handleDownload}
                />
              </>
            )}

            <RecoveryCodesDisplay
              isGenerating={isGeneratingCodes}
              recoveryCodes={recoveryCodes}
              onCopyCode={handleCopyCode}
            />

            {recoveryCodes.length > 0 && <RecoveryCodesWarning />}
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
