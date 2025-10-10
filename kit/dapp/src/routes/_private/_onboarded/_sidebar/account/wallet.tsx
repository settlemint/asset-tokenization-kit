import { PasswordDialog } from "@/components/account/wallet/password-dialog";
import { RecoveryCodesCard } from "@/components/account/wallet/recovery-codes-card";
import { UserWalletCard } from "@/components/account/wallet/user-wallet-card";
import { VerificationFactorsCard } from "@/components/account/wallet/verification-factors-card";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { useSecretCodesManager } from "@/components/onboarding/recovery-codes/use-secret-codes-manager";
import { orpc } from "@/orpc/orpc-client";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_private/_onboarded/_sidebar/account/wallet"
)({
  component: Wallet,
});

function Wallet() {
  const { t } = useTranslation(["user", "common", "onboarding"]);
  const { data: user, refetch: refetchUser } = useSuspenseQuery(
    orpc.user.me.queryOptions()
  );
  const [codesConfirmed, setCodesConfirmed] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const fallbackError = useMemo(
    () =>
      t("common:errors.somethingWentWrong", {
        defaultValue: "Something went wrong",
      }),
    [t]
  );

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
      await refetchUser();
    },
    onGenerateError: (message) => {
      const errorMessage = message || fallbackError;
      setGenerationError(errorMessage);
      toast.error(errorMessage);
    },
    onConfirmError: (message) => {
      const errorMessage = message || fallbackError;
      toast.error(errorMessage);
    },
  });

  const passwordRequired = user.onboardingState.walletRecoveryCodes;

  const handlePasswordSubmit = useCallback(async () => {
    setPasswordError(null);
    if (!password.trim()) {
      setPasswordError(t("user:wallet.passwordRequired"));
      return;
    }
    setIsSubmittingPassword(true);
    const result = await generate({ password });
    setIsSubmittingPassword(false);
    if (result.success) {
      setPassword("");
      setIsPasswordDialogOpen(false);
    }
  }, [generate, password, t]);

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

  const handleConfirmCodes = useCallback(async () => {
    if (!codesConfirmed) {
      return;
    }
    const result = await confirm();
    if (result.success) {
      await refetchUser();
      resetCodes();
      setCodesConfirmed(false);
      setGenerationError(null);
      toast.success(t("common:saved"));
    }
  }, [codesConfirmed, confirm, refetchUser, resetCodes, t]);

  const handleCodesConfirmedChange = useCallback((checked: CheckedState) => {
    setCodesConfirmed(checked === true);
  }, []);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <RouterBreadcrumb />
      <div className="mt-4 space-y-2">
        <h1 className="text-3xl font-bold">{t("wallet.title")}</h1>
        <p className="text-muted-foreground">{t("wallet.description")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <UserWalletCard address={user.wallet} />

        <VerificationFactorsCard verificationTypes={user.verificationTypes} />

        <RecoveryCodesCard
          codes={codes}
          isGenerating={isGenerating}
          isConfirming={isConfirming}
          codesConfirmed={codesConfirmed}
          generationError={generationError}
          onConfirmCodes={handleConfirmCodes}
          onCodesConfirmedChange={handleCodesConfirmedChange}
          onRegenerateClick={handleRegenerateClick}
          onCopyAll={copyAll}
          onDownload={download}
        />
      </div>

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
    </div>
  );
}
