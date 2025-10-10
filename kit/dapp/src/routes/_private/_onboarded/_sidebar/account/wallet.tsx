import { RouterBreadcrumb } from "@/components/breadcrumb/router-breadcrumb";
import { RecoveryCodesActions } from "@/components/onboarding/recovery-codes/recovery-codes-actions";
import { RecoveryCodesDisplay } from "@/components/onboarding/recovery-codes/recovery-codes-display";
import { useSecretCodesManager } from "@/components/onboarding/recovery-codes/use-secret-codes-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { RefreshCw } from "lucide-react";
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

        {/* Verification Factors Card */}
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t("wallet.verificationFactors")}
            </CardTitle>
            <CardDescription>
              {t("wallet.verificationFactorsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {user.verificationTypes.length > 0 ? (
                user.verificationTypes.map((type) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm">
                      {type === "PINCODE" && t("wallet.pinCodeEnabled")}
                      {type === "OTP" && t("wallet.otpEnabled")}
                      {type === "SECRET_CODES" &&
                        t("wallet.recoveryCodesEnabled")}
                    </span>
                    <Badge
                      variant="default"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {t("wallet.enabled")}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  {t("wallet.noVerificationMethods")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recovery Codes Card */}
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
                <RecoveryCodesActions
                  onCopyAll={copyAll}
                  onDownload={download}
                />
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
                    <p className="text-sm text-destructive text-center">
                      {generationError}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
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
