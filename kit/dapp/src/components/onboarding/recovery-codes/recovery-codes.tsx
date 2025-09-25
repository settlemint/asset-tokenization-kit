import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { WarningAlert } from "@/components/ui/warning-alert";
import { authClient } from "@/lib/auth/auth.client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { getRouteApi } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RecoveryCodesActions } from "./recovery-codes-actions";
import { RecoveryCodesDisplay } from "./recovery-codes-display";
import { useRecoveryCodes } from "./use-recovery-codes";

const routeApi = getRouteApi(
  "/_private/onboarding/_sidebar/wallet-recovery-codes"
);

const logger = createLogger();

export function RecoveryCodes() {
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const { recoveryCodesData } = routeApi.useLoaderData();

  // Log the data to see what we're getting
  logger.info("Recovery codes data received:", { data: recoveryCodesData });

  // Handle error case
  if (!recoveryCodesData || (recoveryCodesData && recoveryCodesData.error)) {
    const errorMessage =
      recoveryCodesData &&
      "error" in recoveryCodesData &&
      recoveryCodesData.error &&
      typeof recoveryCodesData.error === "object" &&
      "message" in recoveryCodesData.error
        ? recoveryCodesData.error.message
        : "Unknown error";
    logger.error("Recovery codes generation failed:", {
      error: recoveryCodesData?.error || recoveryCodesData,
      fullData: recoveryCodesData,
    });
    return <RecoveryCodesError error={{ message: errorMessage }} />;
  }

  // Handle the nested data structure from better-auth
  const actualData = recoveryCodesData.data || recoveryCodesData;

  return (
    <RecoveryCodesContent
      recoveryCodesData={actualData}
      onComplete={() =>
        completeStepAndNavigate(OnboardingStep.walletRecoveryCodes)
      }
    />
  );
}

function RecoveryCodesError({ error }: { error: { message?: string } }) {
  const { t } = useTranslation(["onboarding"]);

  return (
    <FormStepLayout
      title={t("wallet-security.recovery-codes.title")}
      description={t("wallet-security.recovery-codes.description")}
      fullWidth={true}
      actions={
        <Button
          onClick={() => {
            globalThis.location.reload();
          }}
        >
          {t("wallet-security.recovery-codes.confirm")}
        </Button>
      }
    >
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            {t("wallet-security.recovery-codes.generated-error")}
          </p>
          {error?.message && (
            <p className="text-xs text-muted-foreground">{error.message}</p>
          )}
        </div>
      </div>
    </FormStepLayout>
  );
}

interface RecoveryCodesContentProps {
  recoveryCodesData: {
    secretCodes?: string[];
  } | null;
  onComplete: () => Promise<void>;
}

function RecoveryCodesContent({
  recoveryCodesData,
  onComplete,
}: RecoveryCodesContentProps) {
  const { t } = useTranslation(["onboarding"]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hasPerformedAction, setHasPerformedAction] = useState(false);

  const recoveryCodes = useMemo(
    () => recoveryCodesData?.secretCodes ?? [],
    [recoveryCodesData]
  );

  const onConfirm = useCallback(async () => {
    try {
      await authClient.secretCodes.confirm({
        stored: true,
      });
      await onComplete();
    } catch (error) {
      logger.error("Failed to confirm recovery codes", error);
      toast.error(t("wallet-security.recovery-codes.confirm-error"));
    }
  }, [onComplete, t]);

  const { handleCopyAll, handleDownload } = useRecoveryCodes(recoveryCodes);

  const handleCopyAllWithTracking = useCallback(() => {
    handleCopyAll();
    setHasPerformedAction(true);
  }, [handleCopyAll]);

  const handleDownloadWithTracking = useCallback(() => {
    handleDownload();
    setHasPerformedAction(true);
  }, [handleDownload]);

  // Show success toast when component mounts with codes
  useEffect(() => {
    if (recoveryCodes.length > 0) {
      toast.success(t("wallet-security.recovery-codes.generated-success"));
    }
  }, [recoveryCodes.length, t]);

  return (
    <FormStepLayout
      title={t("wallet-security.recovery-codes.title")}
      description={t("wallet-security.recovery-codes.description")}
      fullWidth={true}
      actions={
        <Button
          onClick={onConfirm}
          disabled={recoveryCodes.length === 0 || !isConfirmed}
        >
          {t("wallet-security.recovery-codes.confirm")}
        </Button>
      }
    >
      <p className="text-sm mb-6">
        {t("wallet-security.recovery-codes.description-2")}
      </p>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full space-y-6">
          <RecoveryCodesDisplay
            isGenerating={false}
            recoveryCodes={recoveryCodes}
          />

          {recoveryCodes.length > 0 && (
            <WarningAlert
              description={t("wallet-security.recovery-codes.warning")}
            />
          )}
        </div>
      </div>

      {recoveryCodes.length > 0 && (
        <div className="mt-6 space-y-4 border-t pt-6">
          {/* Checkbox Section with Better Visual Prominence */}
          <div className="rounded-lg bg-muted/50 border-2 border-muted p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="recovery-codes-stored"
                checked={isConfirmed}
                disabled={!hasPerformedAction}
                onCheckedChange={(checked) => {
                  setIsConfirmed(checked === true);
                }}
                className="mt-0.5 h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className="flex-1 space-y-1">
                <label
                  htmlFor="recovery-codes-stored"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {t(
                    "wallet-security.recovery-codes.confirm-stored",
                    "Confirm you stored your recovery keys in a safe place."
                  )}
                </label>
                {!hasPerformedAction && (
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "wallet-security.recovery-codes.action-required",
                      "Copy or download your codes first before confirming"
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons in Footer */}
          <RecoveryCodesActions
            onCopyAll={handleCopyAllWithTracking}
            onDownload={handleDownloadWithTracking}
          />
        </div>
      )}
    </FormStepLayout>
  );
}
