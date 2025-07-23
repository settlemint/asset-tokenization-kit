import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RecoveryCodesActions } from "./recovery-codes-actions";
import { RecoveryCodesDisplay } from "./recovery-codes-display";
import { RecoveryCodesWarning } from "./recovery-codes-warning";
import { useRecoveryCodes } from "./use-recovery-codes";

const logger = createLogger();

export function RecoveryCodes() {
  const { t } = useTranslation(["onboarding"]);
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const {
    mutate: generateRecoveryCodes,
    isPending: isGenerating,
    data: recoveryCodesData,
    isSuccess: isGenerated,
    isError: isGeneratedError,
  } = useMutation({
    mutationFn: async () => {
      return await authClient.secretCodes.generate({
        password: undefined,
      });
    },
    onSuccess: () => {
      toast.success(t("wallet-security.recovery-codes.generated-success"));
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t("wallet-security.recovery-codes.generated-error")
      );
    },
  });

  const recoveryCodes = useMemo(
    () => recoveryCodesData?.data?.secretCodes ?? [],
    [recoveryCodesData]
  );

  const onConfirm = useCallback(async () => {
    try {
      await authClient.secretCodes.confirm({
        stored: true,
      });
      await completeStepAndNavigate(OnboardingStep.walletRecoveryCodes);
    } catch (error) {
      logger.error("Failed to confirm recovery codes", error);
      toast.error(t("wallet-security.recovery-codes.confirm-error"));
    }
  }, [completeStepAndNavigate, t]);

  const { handleCopyAll, handleDownload } = useRecoveryCodes(recoveryCodes);

  useEffect(() => {
    const isFinished = isGenerated || isGeneratedError;
    if (isGenerating || isFinished) {
      return;
    }
    const debounceTimeout = setTimeout(() => {
      generateRecoveryCodes();
    }, 200);
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [generateRecoveryCodes, isGenerated, isGeneratedError, isGenerating]);

  return (
    <OnboardingStepLayout
      title={t("wallet-security.recovery-codes.title")}
      description={t("wallet-security.recovery-codes.description")}
      actions={
        <Button
          onClick={onConfirm}
          disabled={isGenerating || recoveryCodes.length === 0}
        >
          {t("wallet-security.recovery-codes.confirm")}
        </Button>
      }
    >
      <p className="text-sm mb-6">
        {t("wallet-security.recovery-codes.description-2")}
      </p>

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
    </OnboardingStepLayout>
  );
}
