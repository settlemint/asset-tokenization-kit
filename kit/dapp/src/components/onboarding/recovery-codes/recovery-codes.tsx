import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { RecoveryCodesActions } from "./recovery-codes-actions";
import { RecoveryCodesDisplay } from "./recovery-codes-display";
import { RecoveryCodesWarning } from "./recovery-codes-warning";
import { useRecoveryCodes } from "./use-recovery-codes";

export function RecoveryCodes() {
  const { refreshUserState, completeStepAndNavigate } =
    useOnboardingNavigation();
  const {
    mutate: generateRecoveryCodes,
    isPending: isGenerating,
    data: recoveryCodesData,
  } = useMutation({
    mutationFn: async () =>
      await authClient.secretCodes.generate({
        password: undefined,
      }),
    onSuccess: async () => {
      await refreshUserState();
      toast.success("Recovery codes generated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to generate recovery codes");
    },
  });

  const recoveryCodes = useMemo(
    () => recoveryCodesData?.data?.secretCodes ?? [],
    [recoveryCodesData]
  );

  const { handleCopyAll, handleDownload } = useRecoveryCodes(recoveryCodes);

  useEffect(() => {
    generateRecoveryCodes();
  }, [generateRecoveryCodes]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Your secret codes</h2>
        <p className="text-sm text-muted-foreground pt-2">
          Save these codes somewhere safe
        </p>
        <p className="text-sm pt-2">
          These codes can be used to recover your wallet if you forget your pin
          or lose access to your authenticator app.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl space-y-6">
          {recoveryCodes.length > 0 && (
            <RecoveryCodesActions
              onCopyAll={handleCopyAll}
              onDownload={handleDownload}
            />
          )}

          <RecoveryCodesDisplay
            isGenerating={isGenerating}
            recoveryCodes={recoveryCodes}
          />

          {recoveryCodes.length > 0 && <RecoveryCodesWarning />}
        </div>
      </div>

      <footer className="pt-6">
        <Button
          onClick={async () => {
            await completeStepAndNavigate(OnboardingStep.walletRecoveryCodes);
          }}
          disabled={isGenerating || recoveryCodes.length === 0}
        >
          Confirm i've stored them
        </Button>
      </footer>
    </div>
  );
}
