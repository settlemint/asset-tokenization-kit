import { useCallback, useState } from "react";

import { RecoveryCodesActions } from "@/components/onboarding/recovery-codes/recovery-codes-actions";
import { RecoveryCodesDisplay } from "@/components/onboarding/recovery-codes/recovery-codes-display";
import { useSecretCodesManager } from "@/components/onboarding/recovery-codes/use-secret-codes-manager";
import { PasswordDialog } from "@/components/password-dialog/password-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { orpc } from "@/orpc/orpc-client";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function RecoveryCodesCard() {
  const { t } = useTranslation(["user", "common", "onboarding"]);
  const { data: user, refetch } = useSuspenseQuery(orpc.user.me.queryOptions());
  //  If the user has not generated recovery codes yet, we don't need to prompt them for a password
  const passwordRequired = user.onboardingState.walletRecoveryCodes;

  const [codesConfirmed, setCodesConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const {
    codes,
    isGenerating,
    isConfirming,
    generate,
    confirm,
    copyAll,
    download,
    resetCodes,
  } = useSecretCodesManager({
    onGenerateSuccess: async () => {
      setCodesConfirmed(false);
      setGenerationError(null);
      toast.success(
        t("onboarding:wallet-security.recovery-codes.generated-success")
      );
      await refetch();
    },
    onGenerateError: (message) => {
      const errorMessage = message || t("common:errors.somethingWentWrong");
      setGenerationError(errorMessage);
      toast.error(errorMessage);
    },
    onConfirmError: (message) => {
      const errorMessage = message || t("common:errors.somethingWentWrong");
      toast.error(errorMessage);
    },
  });

  const handleRegenerateClick = useCallback(() => {
    if (passwordRequired) {
      setPassword("");
      setPasswordError(null);
      setGenerationError(null);
      setIsPasswordDialogOpen(true);
      return;
    }
    void generate();
  }, [generate, passwordRequired]);

  const handleCodesConfirmedChange = useCallback((checked: CheckedState) => {
    setCodesConfirmed(checked === true);
  }, []);

  const handleConfirmCodes = useCallback(async () => {
    if (!codesConfirmed) {
      return;
    }
    const result = await confirm();
    if (result.success) {
      await refetch();
      resetCodes();
      setCodesConfirmed(false);
      setGenerationError(null);
      toast.success(t("common:saved"));
    }
  }, [codesConfirmed, confirm, refetch, resetCodes, t]);

  const handlePasswordSubmit = useCallback(async () => {
    setPasswordError(null);
    if (!password.trim()) {
      setPasswordError(t("user:wallet.passwordRequired"));
      return;
    }
    setIsSubmittingPassword(true);
    try {
      const result = await generate({ password });
      if (result.success) {
        setPassword("");
        setIsPasswordDialogOpen(false);
      } else if (result.error) {
        setPasswordError(result.error);
      }
    } catch (error: unknown) {
      const fallbackMessage = t("common:errors.somethingWentWrong");
      const message = error instanceof Error ? error.message : fallbackMessage;
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsSubmittingPassword(false);
    }
  }, [generate, password, t]);

  return (
    <>
      <Card className="flex h-full flex-col lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("wallet.recoveryCodesCard")}
          </CardTitle>
          <CardDescription>
            {t("wallet.recoveryCodesDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {codes.length > 0 ? (
            <div className="space-y-6">
              <RecoveryCodesDisplay
                isGenerating={isGenerating}
                recoveryCodes={codes}
              />
              <RecoveryCodesActions onCopyAll={copyAll} onDownload={download} />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confirm-stored"
                  checked={codesConfirmed}
                  onCheckedChange={handleCodesConfirmedChange}
                />
                <label
                  htmlFor="confirm-stored"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("wallet.confirmRecoveryCodesStored")}
                </label>
              </div>
              <Button
                onClick={handleConfirmCodes}
                disabled={!codesConfirmed || isConfirming}
                className="w-full"
              >
                {isConfirming ? t("common:generating") : t("common:continue")}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleRegenerateClick}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                  {t("wallet.regenerateRecoveryCodes")}
                </Button>
                {generationError && (
                  <p className="text-center text-sm text-destructive">
                    {generationError}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PasswordDialog
        open={isPasswordDialogOpen}
        password={password}
        passwordError={passwordError}
        generationError={generationError}
        isSubmitting={isSubmittingPassword}
        onPasswordChange={setPassword}
        onCancel={() => {
          setIsPasswordDialogOpen(false);
          setPassword("");
          setPasswordError(null);
          setGenerationError(null);
          setIsSubmittingPassword(false);
        }}
        onSubmit={() => void handlePasswordSubmit()}
      />
    </>
  );
}
