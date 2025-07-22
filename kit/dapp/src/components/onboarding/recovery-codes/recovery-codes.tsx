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
  const { refreshUserState } = useOnboardingNavigation();
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
      await refreshUserState();
    } catch (error) {
      logger.error("Failed to confirm recovery codes", error);
      toast.error(t("wallet-security.recovery-codes.confirm-error"));
    }
  }, [refreshUserState, t]);

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
    <div className="flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          {t("wallet-security.recovery-codes.title")}
        </h2>
        <p className="text-sm text-muted-foreground pt-2">
          {t("wallet-security.recovery-codes.description")}
        </p>
        <p className="text-sm pt-2">
          {t("wallet-security.recovery-codes.description-2")}
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
          onClick={onConfirm}
          disabled={isGenerating || recoveryCodes.length === 0}
        >
          {t("wallet-security.recovery-codes.confirm")}
        </Button>
      </footer>
    </div>
  );
}
