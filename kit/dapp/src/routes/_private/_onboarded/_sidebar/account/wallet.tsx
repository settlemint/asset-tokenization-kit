import { PasswordDialog } from "@/components/account/wallet/password-dialog";
import { RecoveryCodesCard } from "@/components/account/wallet/recovery-codes-card";
import { UserWalletCard } from "@/components/account/wallet/user-wallet-card";
import { VerificationFactorsCard } from "@/components/account/wallet/verification-factors-card";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { useSecretCodesManager } from "@/components/onboarding/recovery-codes/use-secret-codes-manager";
import { PinSetupModal } from "@/components/onboarding/wallet-security/pin-setup-modal";
import { authClient } from "@/lib/auth/auth.client";
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
  const [passwordDialogMode, setPasswordDialogMode] = useState<
    "recoveryCodes" | "changePincode" | null
  >(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isPinSetupOpen, setIsPinSetupOpen] = useState(false);
  const [pendingPincode, setPendingPincode] = useState<string | null>(null);

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
    try {
      if (passwordDialogMode === "recoveryCodes") {
        const result = await generate({ password });
        if (result.success) {
          setPassword("");
          setPasswordDialogMode(null);
        }
      } else if (passwordDialogMode === "changePincode") {
        if (!pendingPincode) {
          throw new Error("Missing pincode");
        }
        const { data, error } = await authClient.pincode.update({
          newPincode: pendingPincode,
          password,
        });
        if (error) {
          const message = error.message ?? fallbackError;
          setPasswordError(message);
          toast.error(message);
          return;
        }
        if (!data?.success) {
          toast.error(fallbackError);
          return;
        }
        toast.success(t("wallet.changePincode.success"));
        await refetchUser();
        setPendingPincode(null);
        setPassword("");
        setPasswordDialogMode(null);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : fallbackError;
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsSubmittingPassword(false);
    }
  }, [
    fallbackError,
    generate,
    password,
    passwordDialogMode,
    pendingPincode,
    refetchUser,
    t,
  ]);

  const handleRegenerateClick = useCallback(() => {
    if (passwordRequired) {
      setPassword("");
      setPasswordError(null);
      setGenerationError(null);
      setPendingPincode(null);
      setPasswordDialogMode("recoveryCodes");
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

        <VerificationFactorsCard
          verificationTypes={user.verificationTypes}
          onChangePincode={() => {
            setPendingPincode(null);
            setIsPinSetupOpen(true);
          }}
        />

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

      <PinSetupModal
        open={isPinSetupOpen}
        onClose={() => {
          setIsPinSetupOpen(false);
        }}
        onSubmitPincode={async (value) => {
          setPendingPincode(value);
          setPassword("");
          setPasswordError(null);
          setGenerationError(null);
          setPasswordDialogMode("changePincode");
          setIsPinSetupOpen(false);
        }}
        title={t("wallet.changePincode.title")}
        description={t("wallet.changePincode.description")}
        submitLabel={t("wallet.changePincode.submit")}
        submittingLabel={t("wallet.changePincode.submitting")}
        skipSuccessToast
        mode="update"
      />

      <PasswordDialog
        open={passwordDialogMode !== null}
        password={password}
        passwordError={passwordError}
        generationError={generationError}
        isSubmitting={isSubmittingPassword}
        onPasswordChange={setPassword}
        onCancel={() => {
          setPasswordDialogMode(null);
          setPassword("");
          setPasswordError(null);
          setGenerationError(null);
          setIsSubmittingPassword(false);
          setPendingPincode(null);
        }}
        onSubmit={() => void handlePasswordSubmit()}
        title={
          passwordDialogMode === "changePincode"
            ? t("wallet.changePincode.passwordTitle")
            : undefined
        }
        description={
          passwordDialogMode === "changePincode"
            ? t("wallet.changePincode.passwordDescription")
            : undefined
        }
        submitLabel={
          passwordDialogMode === "changePincode"
            ? t("wallet.changePincode.passwordSubmit")
            : undefined
        }
        submittingLabel={
          passwordDialogMode === "changePincode"
            ? t("wallet.changePincode.passwordSubmitting")
            : undefined
        }
      />
    </div>
  );
}
