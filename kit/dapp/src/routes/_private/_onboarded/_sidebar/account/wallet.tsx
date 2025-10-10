import { RecoveryCodesCard } from "@/components/account/wallet/recovery-codes-card";
import { VerificationFactorsCard } from "@/components/account/wallet/verification-factors-card";
import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { useSecretCodesManager } from "@/components/onboarding/recovery-codes/use-secret-codes-manager";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Web3Address } from "@/components/web3/web3-address";
import { orpc } from "@/orpc/orpc-client";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
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
        {/* User Wallet Card */}
        {user.wallet ? (
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>{t("wallet.userWallet")}</CardTitle>
              <CardDescription>
                {t("wallet.userWalletDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center gap-6">
              <div className="rounded-lg bg-white p-4 shadow-sm border">
                <QRCode
                  value={user.wallet}
                  size={200}
                  level="H"
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <div className="w-full max-w-md">
                <Web3Address
                  address={user.wallet}
                  showFullAddress={true}
                  copyToClipboard={true}
                  showPrettyName={false}
                  className="justify-center"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex h-full flex-col">
            <CardHeader>
              <CardTitle>{t("wallet.userWallet")}</CardTitle>
              <CardDescription>
                {t("wallet.userWalletDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col items-center justify-center">
              <p className="text-muted-foreground text-center">
                {t("fields.noWalletConnected")}
              </p>
            </CardContent>
          </Card>
        )}

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

      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          setIsPasswordDialogOpen(open);
          if (!open) {
            setPassword("");
            setPasswordError(null);
            setGenerationError(null);
            setIsSubmittingPassword(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("user:wallet.passwordPromptTitle")}</DialogTitle>
            <DialogDescription>
              {t("user:wallet.passwordPromptDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="regenerate-password">
                {t("user:wallet.passwordLabel")}
              </Label>
              <Input
                id="regenerate-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
            {generationError && (
              <p className="text-sm text-destructive">{generationError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isSubmittingPassword) {
                  setIsPasswordDialogOpen(false);
                }
              }}
              disabled={isSubmittingPassword}
            >
              {t("common:actions.cancel")}
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handlePasswordSubmit();
              }}
              disabled={isSubmittingPassword}
            >
              {isSubmittingPassword
                ? t("common:generating")
                : t("user:wallet.regenerateRecoveryCodes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
