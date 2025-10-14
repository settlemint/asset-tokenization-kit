import { PasswordDialog } from "@/components/account/wallet/password-dialog";
import { PinSetupModal } from "@/components/onboarding/wallet-security/pin-setup-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth.client";
import type { VerificationType } from "@atk/zod/verification-type";
import { useCallback, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface VerificationFactorComponentProps {
  label: string;
  enabledLabel: string;
  fallbackError: string;
  onRefetch: () => Promise<unknown>;
}

export function DefaultVerificationFactorItem({
  label,
  enabledLabel,
}: VerificationFactorComponentProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <Badge
        variant="default"
        className="bg-sm-state-success-background text-sm-state-success hover:bg-sm-state-success-background/90"
      >
        {enabledLabel}
      </Badge>
    </div>
  );
}

export function PincodeVerificationFactorItem({
  label,
  enabledLabel,
  fallbackError,
  onRefetch,
}: VerificationFactorComponentProps) {
  const { t } = useTranslation(["user", "common", "onboarding"]);
  const [isPinSetupOpen, setIsPinSetupOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [pendingPincode, setPendingPincode] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handlePasswordSubmit = useCallback(async () => {
    if (!pendingPincode) {
      toast.error(fallbackError);
      return;
    }

    setPasswordError(null);

    if (!password.trim()) {
      setPasswordError(t("user:wallet.passwordRequired"));
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const { data, error } = await authClient.pincode.update({
        newPincode: pendingPincode,
        password,
      });

      if (error) {
        throw new Error(error.message ?? fallbackError);
      }

      if (!data?.success) {
        throw new Error(fallbackError);
      }

      toast.success(t("wallet.changePincode.success"));
      await onRefetch();
      setPendingPincode(null);
      setPassword("");
      setIsPasswordDialogOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : fallbackError;
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsSubmittingPassword(false);
    }
  }, [fallbackError, onRefetch, password, pendingPincode, t]);

  const handleCancelPasswordDialog = useCallback(() => {
    setIsPasswordDialogOpen(false);
    setPassword("");
    setPasswordError(null);
    setIsSubmittingPassword(false);
    setPendingPincode(null);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPendingPincode(null);
              setIsPinSetupOpen(true);
            }}
          >
            {t("wallet.changePincode.button")}
          </Button>
          <Badge
            variant="default"
            className="bg-sm-state-success-background text-sm-state-success hover:bg-sm-state-success-background/90"
          >
            {enabledLabel}
          </Badge>
        </div>
      </div>

      <PinSetupModal
        open={isPinSetupOpen}
        onClose={() => {
          setIsPinSetupOpen(false);
        }}
        onSubmitPincode={(value) => {
          setPendingPincode(value);
          setPassword("");
          setPasswordError(null);
          setIsPasswordDialogOpen(true);
          setIsPinSetupOpen(false);
          return Promise.resolve();
        }}
        title={t("wallet.changePincode.title")}
        description={t("wallet.changePincode.description")}
        submitLabel={t("wallet.changePincode.submit")}
        submittingLabel={t("wallet.changePincode.submitting")}
        skipSuccessToast
        mode="update"
      />

      <PasswordDialog
        open={isPasswordDialogOpen}
        password={password}
        passwordError={passwordError}
        isSubmitting={isSubmittingPassword}
        onPasswordChange={setPassword}
        onCancel={handleCancelPasswordDialog}
        onSubmit={() => void handlePasswordSubmit()}
      />
    </>
  );
}

type VerificationFactorComponents = {
  [Key in VerificationType]?: (
    props: VerificationFactorComponentProps
  ) => JSX.Element;
};

export const VERIFICATION_FACTOR_COMPONENTS: VerificationFactorComponents = {
  PINCODE: PincodeVerificationFactorItem,
};
