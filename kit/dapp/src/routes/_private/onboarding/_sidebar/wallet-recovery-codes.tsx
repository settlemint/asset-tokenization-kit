import {
  createOnboardingBeforeLoad,
  createOnboardingSearchSchema,
} from "@/components/onboarding/route-helpers";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { RecoveryCodesActions } from "@/components/onboarding/wallet-security/recovery-codes-actions";
import { RecoveryCodesComplete } from "@/components/onboarding/wallet-security/recovery-codes-complete";
import { RecoveryCodesDisplay } from "@/components/onboarding/wallet-security/recovery-codes-display";
import { RecoveryCodesWarning } from "@/components/onboarding/wallet-security/recovery-codes-warning";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

const logger = createLogger();

export const Route = createFileRoute(
  "/_private/onboarding/_sidebar/wallet-recovery-codes"
)({
  validateSearch: createOnboardingSearchSchema(),
  beforeLoad: createOnboardingBeforeLoad(OnboardingStep.walletRecoveryCodes),
  component: RouteComponent,
});

function RouteComponent() {
  const subStep = Route.useSearch({
    select: (search) => search.subStep,
  });
  const { handleMutationSuccess } = useOnboardingNavigation();

  const {
    mutate: generateRecoveryCodes,
    isPending: isGeneratingCodes,
    data: recoveryCodesData,
  } = useMutation({
    mutationFn: async () =>
      authClient.secretCodes.generate({
        password: undefined,
      }),
    onSuccess: async () => {
      // Clear auth session cache to ensure UI reflects updated auth state
      await authClient.getSession({
        query: {
          disableCookieCache: true,
        },
      });

      // No need to show a toast here as the codes are displayed in the UI
    },
    onError: (error: Error) => {
      logger.error("generateRecoveryCodes error:", error);
      toast.error(error.message || "Failed to generate recovery codes");
    },
  });

  const recoveryCodes = useMemo(
    () => recoveryCodesData?.data?.secretCodes ?? [],
    [recoveryCodesData]
  );

  // Event handlers
  const handleCopyAll = () => {
    void navigator.clipboard.writeText(recoveryCodes.join("\n"));
    toast.success("Recovery codes copied to clipboard!");
  };

  const handleDownload = () => {
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
  };

  const handleCopyCode = (code: string, index: number) => {
    void navigator.clipboard.writeText(code);
    toast.success(`Code ${index + 1} copied!`);
  };

  const onNext = () =>
    void handleMutationSuccess(OnboardingStep.walletRecoveryCodes);

  useEffect(() => {
    // Only generate recovery codes if we're not in the complete state
    if (subStep !== "complete") {
      generateRecoveryCodes();
    }
  }, [generateRecoveryCodes, subStep]);

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
