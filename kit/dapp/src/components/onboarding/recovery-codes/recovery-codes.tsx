import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { OnboardingStep } from "@/components/onboarding/state-machine";
import { useOnboardingNavigation } from "@/components/onboarding/use-onboarding-navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { Route } from "@/routes/_private/onboarding/_sidebar/wallet-recovery-codes";
import { useCallback, useMemo, Suspense, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { RecoveryCodesActions } from "./recovery-codes-actions";
import { RecoveryCodesDisplay } from "./recovery-codes-display";
import { RecoveryCodesWarning } from "./recovery-codes-warning";
import { useRecoveryCodes } from "./use-recovery-codes";
import { RecoveryCodesSkeleton } from "./recovery-codes-skeleton";
import { Await } from "@tanstack/react-router";

const logger = createLogger();

export function RecoveryCodes() {
  const { completeStepAndNavigate } = useOnboardingNavigation();
  const { recoveryCodesData } = Route.useLoaderData();

  return (
    <Suspense fallback={<RecoveryCodesLoader />}>
      <Await promise={recoveryCodesData}>
        {(data) => {
          // Log the data to see what we're getting
          logger.info("Recovery codes data received:", { data });

          // Handle error case
          if (!data || (data && data.error)) {
            const errorMessage =
              data &&
              "error" in data &&
              data.error &&
              typeof data.error === "object" &&
              "message" in data.error
                ? data.error.message
                : "Unknown error";
            logger.error("Recovery codes generation failed:", {
              error: data?.error || data,
              fullData: data,
            });
            return <RecoveryCodesError error={{ message: errorMessage }} />;
          }

          // Handle the nested data structure from better-auth
          const actualData = data.data || data;

          return (
            <RecoveryCodesContent
              recoveryCodesData={actualData}
              onComplete={() =>
                completeStepAndNavigate(OnboardingStep.walletRecoveryCodes)
              }
            />
          );
        }}
      </Await>
    </Suspense>
  );
}

function RecoveryCodesLoader() {
  const { t } = useTranslation(["onboarding"]);

  return (
    <OnboardingStepLayout
      title={t("wallet-security.recovery-codes.title")}
      description={t("wallet-security.recovery-codes.description")}
      actions={
        <Button disabled>{t("wallet-security.recovery-codes.confirm")}</Button>
      }
    >
      <p className="text-sm mb-6">
        {t("wallet-security.recovery-codes.description-2")}
      </p>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl space-y-6">
          <RecoveryCodesSkeleton />
        </div>
      </div>
    </OnboardingStepLayout>
  );
}

function RecoveryCodesError({ error }: { error: { message?: string } }) {
  const { t } = useTranslation(["onboarding"]);

  return (
    <OnboardingStepLayout
      title={t("wallet-security.recovery-codes.title")}
      description={t("wallet-security.recovery-codes.description")}
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
    </OnboardingStepLayout>
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

  // Show success toast when component mounts with codes
  useEffect(() => {
    if (recoveryCodes.length > 0) {
      toast.success(t("wallet-security.recovery-codes.generated-success"));
    }
  }, [recoveryCodes.length, t]);

  return (
    <OnboardingStepLayout
      title={t("wallet-security.recovery-codes.title")}
      description={t("wallet-security.recovery-codes.description")}
      actions={
        <Button onClick={onConfirm} disabled={recoveryCodes.length === 0}>
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
            isGenerating={false}
            recoveryCodes={recoveryCodes}
          />

          {recoveryCodes.length > 0 && <RecoveryCodesWarning />}
        </div>
      </div>
    </OnboardingStepLayout>
  );
}
